# AgriSense Frontend (Next.js)

## Setup

1. Copy `.env.local.example` to `.env.local`.
2. Update the backend base URL if needed.

Example:

NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

## Install and run

npm install
npm run dev

The app starts at http://localhost:3000.

## Backend requirement

The Flask backend must be running on port 5000 and should have:

OPENWEATHER_API_KEY=<your_openweather_api_key>

Example (PowerShell):

$env:OPENWEATHER_API_KEY="your_key_here"
python app.py

## Features wired

- Crop prediction using `/api/predict`
- Weather search by city using `/api/weather`
- Geolocation weather lookup using `/api/weather/by-coords`
- Mock market prices using `/api/market-prices`
