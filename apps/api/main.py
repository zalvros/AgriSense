import httpx
from typing import Optional, Literal
from fastapi import FastAPI, Query, HTTPException, Response
from pydantic import BaseModel, Field
from cachetools import TTLCache
import os
from dotenv import load_dotenv
import json
from datetime import datetime, timedelta, timezone
import asyncio
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
import redis.asyncio as aioredis
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from urllib.parse import quote

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")

load_dotenv()


scheduler_instance = None


def _start_scheduler():
    global scheduler_instance
    scheduler_instance = AsyncIOScheduler()
    # pick top combos from mock data
    combos = []
    seen = set()
    for r in MOCK_DATA:
        combo = (r.get("state", ""), r.get("commodity", ""))
        if combo not in seen:
            seen.add(combo)
            combos.append(combo)
        if len(combos) >= 10:
            break

    async def job():
        for state, commodity in combos:
            await _refresh_combo(state, commodity, limit=100)

    scheduler_instance.add_job(job, "interval", minutes=10)
    scheduler_instance.start()


def _stop_scheduler():
    global scheduler_instance
    if scheduler_instance:
        scheduler_instance.shutdown()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    _start_scheduler()
    yield
    # shutdown
    _stop_scheduler()


app = FastAPI(
    title="AgriSense Mandi API",
    description="Live agricultural commodity prices from APMC mandis",
    version="1.1.0",
    lifespan=lifespan,
)

# Config
DATAGOV_API_KEY = os.getenv("AGRISENSE_DATAGOV_API_KEY", "579b464db66ec23bdd0000015476d92a22f2481a7d83f9d2bbee6c16")
BASE_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
FRONTEND_ORIGIN = os.getenv("NEXT_PUBLIC_FRONTEND_URL", "http://localhost:3000")
REDIS_URL = os.getenv("REDIS_URL", "")

# In-memory fallback cache if Redis not configured
local_cache: TTLCache = TTLCache(maxsize=512, ttl=900)
redis_client: Optional[aioredis.Redis] = None

# initialize redis if configured
if REDIS_URL:
    try:
        redis_client = aioredis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)
    except Exception:
        redis_client = None

# Rate limiting tracker: last upstream call timestamps
last_upstream_call: dict[str, datetime] = {}
RATE_LIMIT_SECONDS = 600  # 10 minutes per state+commodity

# Load mock data
ROOT_DIR = os.path.dirname(__file__)
MOCK_PATH = os.path.join(ROOT_DIR, "data", "mock_mandi_prices.json")
with open(MOCK_PATH, "r", encoding="utf-8") as f:
    MOCK_DATA = json.load(f)


# Pydantic models
class PriceRecord(BaseModel):
    state: str
    district: str
    market: str
    commodity: str
    variety: str
    min_price: float
    max_price: float
    modal_price: float
    price_date: str
    trend: Literal["Up", "Down", "Stable"]
    source: str


class PricesResponse(BaseModel):
    records: list[PriceRecord]
    total: int
    source: Literal["live", "cache", "mock"]
    fetched_at: str


def _make_cache_key(state: str, commodity: str, limit: int) -> str:
    s = state or "__any__"
    c = commodity or "__any__"
    return f"prices:{s}:{c}:{limit}"


async def fetch_live_prices(state: str = "", commodity: str = "", limit: int = 50) -> list[dict]:
    params = {"format": "json", "limit": limit}
    if state:
        params["filters[State]"] = state
    if commodity:
        params["filters[Commodity]"] = commodity

    headers = {}
    if DATAGOV_API_KEY:
        headers["api-key"] = DATAGOV_API_KEY

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(BASE_URL, params=params, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        return data.get("records", [])


def _convert_record(raw: dict) -> PriceRecord:
    # guard and map common field names
    def getf(keys, default=""):
        for k in keys:
            if k in raw:
                return raw.get(k)
        return default

    state = getf(["State", "state"], "")
    district = getf(["District", "district"], "")
    market = getf(["Market", "market"], "")
    commodity = getf(["Commodity", "commodity"], "")
    variety = getf(["Variety", "variety"], "")
    price_date = getf(["Arrival_Date", "price_date", "date"], "")
    try:
        min_price = float(getf(["Min_x0020_Price", "min_price"], 0) or 0)
    except Exception:
        min_price = 0.0
    try:
        max_price = float(getf(["Max_x0020_Price", "max_price"], 0) or 0)
    except Exception:
        max_price = 0.0
    try:
        modal_price = float(getf(["Modal_x0020_Price", "modal_price"], 0) or 0)
    except Exception:
        modal_price = 0.0

    # simple trend heuristic
    trend = "Stable"
    if modal_price and min_price and modal_price > min_price:
        trend = "Up"
    elif modal_price and max_price and modal_price < max_price:
        trend = "Down"

    return PriceRecord(
        state=state,
        district=district,
        market=market,
        commodity=commodity,
        variety=variety,
        min_price=min_price,
        max_price=max_price,
        modal_price=modal_price,
        price_date=price_date,
        trend=trend,
        source="live",
    )


async def _get_cached_or_mock(state: str, commodity: str, limit: int):
    key = _make_cache_key(state, commodity, limit)
    # check redis first
    if redis_client:
        try:
            raw = await redis_client.get(key)
            if raw:
                data = json.loads(raw)
                return [PriceRecord(**r) for r in data], "cache"
        except Exception:
            pass

    # check local in-memory cache
    if key in local_cache:
        return local_cache[key], "cache"
    # fallback to mock
    records = [PriceRecord(**r) for r in MOCK_DATA][:limit]
    return records, "mock"


@app.get("/api/prices")
async def get_prices(response: Response, state: str = Query("", description="Filter by state"), commodity: str = Query("", description="Filter by commodity"), limit: int = Query(50, ge=1, le=500)):
    key = _make_cache_key(state, commodity, limit)
    now = datetime.now(timezone.utc)

    # rate limit upstream per combo
    combo = f"{state}:{commodity}"
    last = last_upstream_call.get(combo)
    allowed_upstream = last is None or (now - last).total_seconds() >= RATE_LIMIT_SECONDS

    # try live if allowed
    try:
        if allowed_upstream:
            raw = await fetch_live_prices(state, commodity, limit)
            records = []
            for r in raw:
                try:
                    pr = _convert_record(r)
                    records.append(pr)
                except Exception:
                    continue

            if records:
                # cache in local cache
                local_cache[key] = records
                last_upstream_call[combo] = now
                fetched_at = datetime.now(timezone.utc).isoformat()
                response.headers["X-Data-Source"] = "live"
                response.headers["X-Fetched-At"] = fetched_at
                return {"records": [r.dict() for r in records], "total": len(records), "source": "live", "fetched_at": fetched_at}

    except Exception as e:
        # log and fall through to cache/mock
        app.logger = getattr(app, "logger", None)
        if app.logger:
            app.logger.warning(f"Live fetch failed: {e}")

    # try cache or mock
    cached, source = await _get_cached_or_mock(state, commodity, limit)
    fetched_at = datetime.now(timezone.utc).isoformat()
    response.headers["X-Data-Source"] = source
    response.headers["X-Fetched-At"] = fetched_at
    return {"records": [r.dict() for r in cached], "total": len(cached), "source": source, "fetched_at": fetched_at}


@app.post("/api/admin/clear-cache")
async def clear_cache(key: str = ""):
    """Clear a specific cache key or all cache when key empty"""
    if key:
        if redis_client:
            await redis_client.delete(key)
        if key in local_cache:
            del local_cache[key]
        return {"cleared": key}

    # clear all
    if redis_client:
        try:
            await redis_client.flushdb()
        except Exception:
            pass
    local_cache.clear()
    return {"cleared": "all"}


def _setup_cors():
    origins = [FRONTEND_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o for o in origins if o],
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )


_setup_cors()


async def _refresh_combo(state: str, commodity: str, limit: int = 100):
    try:
        raw = await fetch_live_prices(state, commodity, limit)
        records = []
        for r in raw:
            try:
                pr = _convert_record(r)
                records.append(pr)
            except Exception:
                continue
        key = _make_cache_key(state, commodity, limit)
        if records:
            local_cache[key] = records
            if redis_client:
                try:
                    await redis_client.set(key, json.dumps([r.dict() for r in records]), ex=900)
                except Exception:
                    pass
    except Exception:
        pass


@app.get("/api/prices/states")
async def get_states():
    # derive from mock/local cache
    all_records = []
    # include cache
    for v in list(local_cache.values()):
        for r in v:
            all_records.append(r)
    # include mock
    all_records.extend([PriceRecord(**r) for r in MOCK_DATA])
    states = sorted({r.state for r in all_records if r.state})
    return {"states": states}


@app.get("/api/prices/commodities")
async def get_commodities():
    all_records = []
    for v in list(local_cache.values()):
        for r in v:
            all_records.append(r)
    all_records.extend([PriceRecord(**r) for r in MOCK_DATA])
    commodities = sorted({r.commodity for r in all_records if r.commodity})
    return {"commodities": commodities}


@app.get("/api/prices/summary")
async def get_summary():
    # compute summary over mock + cache
    all_records = []
    for v in list(local_cache.values()):
        for r in v:
            all_records.append(r)
    all_records.extend([PriceRecord(**r) for r in MOCK_DATA])

    if not all_records:
        return {"avg_modal_price": 0.0, "highest_price": 0.0, "lowest_price": 0.0, "markets_listed": 0}

    modal_prices = [r.modal_price for r in all_records if r.modal_price is not None]
    avg_modal = sum(modal_prices) / len(modal_prices) if modal_prices else 0.0
    highest = max((r.max_price for r in all_records), default=0.0)
    lowest = min((r.min_price for r in all_records), default=0.0)
    markets = len({(r.market, r.state) for r in all_records})

    return {
        "avg_modal_price": round(avg_modal, 2),
        "highest_price": highest,
        "lowest_price": lowest,
        "markets_listed": markets,
    }


async def _fetch_coords_for_city(city: str):
    """Use OpenWeather geocoding API to get lat/lon for a city"""
    if not OPENWEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENWEATHER_API_KEY not configured")
    url = f\"http://api.openweathermap.org/geo/1.0/direct?q={quote(city)}&limit=1&appid={OPENWEATHER_API_KEY}\"
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url)
        r.raise_for_status()
        data = r.json()
        if not data:
            raise HTTPException(status_code=404, detail="City not found")
        return data[0]["lat"], data[0]["lon"], data[0].get("country", "")


async def _fetch_onecall(lat: float, lon: float, days: int = 7):
    if not OPENWEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENWEATHER_API_KEY not configured")
    url = f"https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude=minutely,hourly&units=metric&appid={OPENWEATHER_API_KEY}"
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url)
        r.raise_for_status()
        return r.json()


def _agri_advisory_from_weather(city: str, current: dict, daily: list[dict]):
    # simple heuristic rules
    humidity = current.get("humidity", 0)
    min_temps = [d.get("temp", {}).get("min", 999) for d in daily[:7]]
    frost_risk = any(t < 4 for t in min_temps)
    fungal_risk = humidity > 80
    irrigation_needed = any(d.get("rain", 0) < 2 for d in daily[:2]) and not fungal_risk

    advice = []
    if irrigation_needed:
        advice.append("Low recent rainfall — consider irrigation where feasible.")
    if fungal_risk:
        advice.append("High humidity detected — monitor for fungal diseases; consider preventive fungicide for susceptible crops.")
    if frost_risk:
        advice.append("Frost risk detected — protect sensitive crops during night-time.")
    advice.append("Check soil moisture sensors before large irrigation runs to save water.")
    return {
        "irrigation_needed": irrigation_needed,
        "frost_risk": frost_risk,
        "fungal_risk": fungal_risk,
        "advice": advice,
    }


@app.get("/api/weather/current")
async def weather_current(city: str = Query(...)):
    cache_key = f"weather:current:{city.lower()}"
    # try redis
    if redis_client:
        try:
            raw = await redis_client.get(cache_key)
            if raw:
                return json.loads(raw)
        except Exception:
            pass

    lat, lon, country = await _fetch_coords_for_city(city)
    data = await _fetch_onecall(lat, lon, days=1)
    current = data.get("current", {})
    result = {
        "city": city,
        "country": country,
        "temperature": current.get("temp"),
        "humidity": current.get("humidity"),
        "feels_like": current.get("feels_like"),
        "wind_speed": current.get("wind_speed"),
        "condition": current.get("weather", [{}])[0].get("description", ""),
        "icon_code": current.get("weather", [{}])[0].get("icon", ""),
        "uv_index": current.get("uvi"),
        "visibility": current.get("visibility"),
    }
    if redis_client:
        try:
            await redis_client.set(cache_key, json.dumps(result), ex=1800)
        except Exception:
            pass
    return result


@app.get("/api/weather/forecast")
async def weather_forecast(city: str = Query(...), days: int = Query(7, ge=1, le=14)):
    cache_key = f"weather:forecast:{city.lower()}:{days}"
    if redis_client:
        try:
            raw = await redis_client.get(cache_key)
            if raw:
                return json.loads(raw)
        except Exception:
            pass

    lat, lon, _ = await _fetch_coords_for_city(city)
    data = await _fetch_onecall(lat, lon, days=days)
    daily = data.get("daily", [])[:days]
    out = []
    for d in daily:
        out.append({
            "date": datetime.fromtimestamp(d.get("dt"), tz=timezone.utc).strftime("%Y-%m-%d"),
            "temp_min": d.get("temp", {}).get("min"),
            "temp_max": d.get("temp", {}).get("max"),
            "condition": d.get("weather", [{}])[0].get("description", ""),
            "rainfall_mm": d.get("rain", 0),
            "humidity": d.get("humidity"),
        })

    if redis_client:
        try:
            await redis_client.set(cache_key, json.dumps(out), ex=1800)
        except Exception:
            pass
    return out


@app.get("/api/weather/agri-advisory")
async def weather_advisory(city: str = Query(...)):
    # fetch current + forecast
    lat, lon, _ = await _fetch_coords_for_city(city)
    data = await _fetch_onecall(lat, lon, days=7)
    current = data.get("current", {})
    daily = data.get("daily", [])
    advisory = _agri_advisory_from_weather(city, current, daily)
    return advisory


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "agrisense-mandi-api"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
