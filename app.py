import os
import pickle
from typing import Any, Dict, List

import numpy as np
import requests
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load a local .env file if present (lightweight, no extra dependency)
def _load_local_dotenv(path: str) -> None:
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as fh:
        for raw in fh:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, val = line.split("=", 1)
            key = key.strip()
            val = val.strip()
            if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                val = val[1:-1]
            # do not override existing environment variables
            if key and not os.environ.get(key):
                os.environ[key] = val


# attempt to load .env from project root
_load_local_dotenv(os.path.join(BASE_DIR, ".env"))


def load_pickle(file_name: str):
    with open(os.path.join(BASE_DIR, file_name), "rb") as f:
        return pickle.load(f)


# importing model and scalers
model = load_pickle("model.pkl")
sc = load_pickle("standscaler.pkl")
ms = load_pickle("minmaxscaler.pkl")


app = Flask(__name__)
CORS(app)

CROP_DICT = {
    1: "Rice",
    2: "Maize",
    3: "Jute",
    4: "Cotton",
    5: "Coconut",
    6: "Papaya",
    7: "Orange",
    8: "Apple",
    9: "Muskmelon",
    10: "Watermelon",
    11: "Grapes",
    12: "Mango",
    13: "Banana",
    14: "Pomegranate",
    15: "Lentil",
    16: "Blackgram",
    17: "Mungbean",
    18: "Mothbeans",
    19: "Pigeonpeas",
    20: "Kidneybeans",
    21: "Chickpea",
    22: "Coffee",
}


CROP_GUIDE: Dict[str, Dict[str, str]] = {
    "Rice": {
        "season": "Kharif",
        "soil": "Clayey to loamy, high water retention",
        "tips": "Maintain standing water in early growth and ensure balanced NPK feeding.",
    },
    "Maize": {
        "season": "Kharif/Rabi",
        "soil": "Well-drained loamy soil",
        "tips": "Avoid waterlogging and monitor fall armyworm pressure.",
    },
    "Jute": {
        "season": "Kharif",
        "soil": "Alluvial loam to clay loam with good moisture",
        "tips": "Sow before peak monsoon, keep fields weed-free early, and ensure proper retting after harvest.",
    },
    "Cotton": {
        "season": "Kharif",
        "soil": "Black cotton soil with good drainage",
        "tips": "Use timely pest scouting and avoid excessive nitrogen.",
    },
    "Coconut": {
        "season": "Year-round in tropical climates",
        "soil": "Sandy loam to lateritic, deep and well-drained",
        "tips": "Irrigate during dry spells, apply organic mulch, and maintain basin nutrition with potassium.",
    },
    "Papaya": {
        "season": "Spring/Monsoon",
        "soil": "Fertile, well-drained sandy loam",
        "tips": "Avoid water stagnation, stake young plants, and remove diseased plants quickly.",
    },
    "Orange": {
        "season": "Monsoon or spring planting",
        "soil": "Well-drained loam with slight acidity",
        "tips": "Ensure regular pruning, micronutrient sprays, and consistent irrigation during fruit set.",
    },
    "Apple": {
        "season": "Temperate spring planting",
        "soil": "Deep loamy soil with good drainage and pH 5.5-6.5",
        "tips": "Use suitable rootstock, maintain chilling requirement compatibility, and follow annual pruning.",
    },
    "Muskmelon": {
        "season": "Summer",
        "soil": "Sandy loam with high organic matter",
        "tips": "Use raised beds, controlled irrigation, and stop overwatering near maturity for better sweetness.",
    },
    "Watermelon": {
        "season": "Summer",
        "soil": "Well-drained sandy loam",
        "tips": "Maintain drip irrigation, mulch the base, and manage pollination for uniform fruit shape.",
    },
    "Grapes": {
        "season": "Winter planting / perennial management",
        "soil": "Deep, well-drained loam to clay loam",
        "tips": "Adopt canopy management, balanced pruning, and preventive disease sprays in humid periods.",
    },
    "Mango": {
        "season": "Monsoon planting",
        "soil": "Well-drained alluvial or loamy soil",
        "tips": "Avoid waterlogging, prune after harvest, and apply nutrients before flowering flush.",
    },
    "Banana": {
        "season": "Year-round in warm regions",
        "soil": "Rich loam with high organic matter",
        "tips": "Irrigate consistently and maintain potassium-rich nutrition.",
    },
    "Pomegranate": {
        "season": "Monsoon/Spring",
        "soil": "Light to medium loam with good drainage",
        "tips": "Regulate irrigation to reduce fruit cracking and monitor bacterial blight in humid weather.",
    },
    "Lentil": {
        "season": "Rabi",
        "soil": "Loamy to clay loam, moderately fertile",
        "tips": "Use seed treatment before sowing and avoid excess irrigation after flowering.",
    },
    "Blackgram": {
        "season": "Kharif/Summer",
        "soil": "Well-drained loam to clay loam",
        "tips": "Apply rhizobium inoculation and ensure one critical irrigation at flowering if dry.",
    },
    "Mungbean": {
        "season": "Kharif/Summer",
        "soil": "Sandy loam to loam with good drainage",
        "tips": "Keep weed pressure low in first 25 days and harvest promptly to minimize pod shattering.",
    },
    "Mothbeans": {
        "season": "Kharif in arid regions",
        "soil": "Light sandy soil, low fertility tolerant",
        "tips": "Prefer rainfed sowing with wide spacing and protect seedlings from early moisture stress.",
    },
    "Pigeonpeas": {
        "season": "Kharif",
        "soil": "Well-drained loam to sandy loam",
        "tips": "Use intercropping, manage pod borer proactively, and avoid standing water.",
    },
    "Kidneybeans": {
        "season": "Rabi/Summer in cool conditions",
        "soil": "Fertile loam with neutral pH",
        "tips": "Provide light, frequent irrigation and maintain good aeration around root zone.",
    },
    "Chickpea": {
        "season": "Rabi",
        "soil": "Well-drained sandy loam to clay loam",
        "tips": "Sow on residual moisture, avoid over-irrigation, and monitor wilt and pod borer.",
    },
    "Coffee": {
        "season": "Monsoon planting",
        "soil": "Well-drained acidic soil under partial shade",
        "tips": "Maintain mulch cover and focus on shade management.",
    },
}


MOCK_MARKET_PRICES: List[Dict[str, Any]] = [
    {"crop": "Rice", "market": "Delhi Mandi", "pricePerQuintal": 2450, "trend": "up", "updatedAt": "2026-04-29"},
    {"crop": "Wheat", "market": "Lucknow Mandi", "pricePerQuintal": 2310, "trend": "down", "updatedAt": "2026-04-29"},
    {"crop": "Maize", "market": "Indore Mandi", "pricePerQuintal": 2140, "trend": "up", "updatedAt": "2026-04-29"},
    {"crop": "Cotton", "market": "Nagpur Mandi", "pricePerQuintal": 6940, "trend": "stable", "updatedAt": "2026-04-29"},
    {"crop": "Sugarcane", "market": "Pune Mandi", "pricePerQuintal": 370, "trend": "stable", "updatedAt": "2026-04-29"},
]


def _extract_prediction_fields(payload: Dict[str, Any]) -> List[float]:
    try:
        return [
            float(payload["N"]),
            float(payload["P"]),
            float(payload["K"]),
            float(payload["temperature"]),
            float(payload["humidity"]),
            float(payload["ph"]),
            float(payload["rainfall"]),
        ]
    except (KeyError, TypeError, ValueError) as exc:
        raise ValueError(
            "Payload must include numeric fields: N, P, K, temperature, humidity, ph, rainfall"
        ) from exc


def _format_weather_response(data: Dict[str, Any]) -> Dict[str, Any]:
    weather = data.get("weather", [{}])[0]
    main = data.get("main", {})
    wind = data.get("wind", {})
    rain = data.get("rain", {})

    return {
        "city": data.get("name"),
        "country": data.get("sys", {}).get("country"),
        "description": weather.get("description"),
        "icon": weather.get("icon"),
        "temperature": main.get("temp"),
        "humidity": main.get("humidity"),
        "feelsLike": main.get("feels_like"),
        "windSpeed": wind.get("speed"),
        "rainfallLastHour": rain.get("1h", 0),
        "rainfallLast3Hours": rain.get("3h", 0),
    }


@app.get("/")
def root():
    return jsonify({
        "message": "Crop Recommendation API is running.",
        "docs": {
            "health": "/api/health",
            "predict": "/api/predict",
            "weatherByCity": "/api/weather?city=London",
            "weatherByCoords": "/api/weather/by-coords?lat=..&lon=..",
            "marketPrices": "/api/market-prices",
        },
    })


@app.get("/img.jpg")
def crop_image():
    return send_from_directory(BASE_DIR, "img.jpg")


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/api/predict")
def predict():
    payload = request.get_json(silent=True) or {}

    try:
        feature_list = _extract_prediction_fields(payload)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    single_pred = np.array(feature_list, dtype=float).reshape(1, -1)
    scaled_features = ms.transform(single_pred)
    final_features = sc.transform(scaled_features)
    prediction = model.predict(final_features)

    prediction_value = prediction[0]
    predicted_crop = CROP_DICT.get(int(prediction_value), str(prediction_value))
    guide = CROP_GUIDE.get(
        predicted_crop,
        {
            "season": "Check local agronomy calendar",
            "soil": "Validate soil texture and organic content",
            "tips": "Use local extension recommendations for fertilizer and irrigation.",
        },
    )

    return jsonify(
        {
            "recommendedCrop": predicted_crop,
            "modelOutput": str(prediction_value),
            "guide": guide,
            "imageUrl": f"{request.host_url.rstrip('/')}/img.jpg",
            "inputs": {
                "N": feature_list[0],
                "P": feature_list[1],
                "K": feature_list[2],
                "temperature": feature_list[3],
                "humidity": feature_list[4],
                "ph": feature_list[5],
                "rainfall": feature_list[6],
            },
        }
    )


@app.get("/api/weather")
def weather_by_city():
    city = request.args.get("city", "").strip()
    if not city:
        return jsonify({"error": "Query parameter 'city' is required."}), 400

    api_key = os.getenv("OPENWEATHER_API_KEY", "").strip()
    if not api_key:
        return jsonify({"error": "OPENWEATHER_API_KEY is not configured on the backend."}), 500

    try:
        response = requests.get(
            "https://api.openweathermap.org/data/2.5/weather",
            params={"q": city, "appid": api_key, "units": "metric"},
            timeout=12,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        return jsonify({"error": "Unable to fetch weather data.", "details": str(exc)}), 502

    return jsonify(_format_weather_response(response.json()))


@app.get("/api/weather/by-coords")
def weather_by_coords():
    lat = request.args.get("lat", "").strip()
    lon = request.args.get("lon", "").strip()

    if not lat or not lon:
        return jsonify({"error": "Query parameters 'lat' and 'lon' are required."}), 400

    api_key = os.getenv("OPENWEATHER_API_KEY", "").strip()
    if not api_key:
        return jsonify({"error": "OPENWEATHER_API_KEY is not configured on the backend."}), 500

    try:
        response = requests.get(
            "https://api.openweathermap.org/data/2.5/weather",
            params={"lat": lat, "lon": lon, "appid": api_key, "units": "metric"},
            timeout=12,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        return jsonify({"error": "Unable to fetch weather data.", "details": str(exc)}), 502

    return jsonify(_format_weather_response(response.json()))


@app.get("/api/market-prices")
def market_prices():
    query = request.args.get("q", "").strip().lower()
    if not query:
        return jsonify({"prices": MOCK_MARKET_PRICES})

    filtered = [
        item
        for item in MOCK_MARKET_PRICES
        if query in item["crop"].lower() or query in item["market"].lower()
    ]
    return jsonify({"prices": filtered})


if __name__ == "__main__":
    app.run(debug=True)