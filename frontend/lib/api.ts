import { MarketPrice, PredictionInput, PredictionResponse, WeatherResponse } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function safeJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }
  return data as T;
}

export async function fetchWeatherByCity(city: string): Promise<WeatherResponse> {
  const res = await fetch(`${API_BASE_URL}/api/weather?city=${encodeURIComponent(city)}`);
  return safeJson<WeatherResponse>(res);
}

export async function fetchWeatherByCoords(lat: number, lon: number): Promise<WeatherResponse> {
  const res = await fetch(`${API_BASE_URL}/api/weather/by-coords?lat=${lat}&lon=${lon}`);
  return safeJson<WeatherResponse>(res);
}

export async function predictCrop(payload: PredictionInput): Promise<PredictionResponse> {
  const res = await fetch(`${API_BASE_URL}/api/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return safeJson<PredictionResponse>(res);
}

export async function fetchMarketPrices(query = ""): Promise<MarketPrice[]> {
  // Legacy wrapper: if `query` includes state or commodity as `state:<s>` or `commodity:<c>`
  const q = query.trim();
  let endpoint = `${API_BASE_URL}/api/prices`;
  if (q) {
    // simple search param passthrough
    endpoint = `${endpoint}?q=${encodeURIComponent(q)}`;
  }

  const res = await fetch(endpoint);
  const data = await safeJson<{ records: any[]; total: number; source?: string; fetched_at?: string }>(res);

  // map PriceRecord -> MarketPrice
  const records = (data.records || []).map((r) => ({
    crop: r.commodity || r.crop || "",
    market: r.market || "",
    pricePerQuintal: Number(r.modal_price ?? r.modal_price ?? r.pricePerQuintal ?? 0),
    trend: (r.trend || "stable").toLowerCase(),
    updatedAt: data.fetched_at || "",
  })) as MarketPrice[];

  return records;
}

export { API_BASE_URL };
