"use client";

import { useEffect, useState } from "react";
import { LocateFixed, Search } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { WeatherCardSkeleton } from "@/components/skeleton";
import { useToast } from "@/components/toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function WeatherPage() {
  const { addToast } = useToast();
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<any | null>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [advisory, setAdvisory] = useState<any | null>(null);

  async function searchCity(q: string) {
    if (!q.trim()) {
      addToast("Please enter a city name", "warning", 2000);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const curRes = await fetch(`${API}/api/weather/current?city=${encodeURIComponent(q)}`);
      if (!curRes.ok) throw new Error(`Weather API error: ${curRes.status}`);
      const cur = await curRes.json();
      
      const fcRes = await fetch(`${API}/api/weather/forecast?city=${encodeURIComponent(q)}&days=7`);
      if (!fcRes.ok) throw new Error(`Forecast API error: ${fcRes.status}`);
      const fc = await fcRes.json();
      
      const advRes = await fetch(`${API}/api/weather/agri-advisory?city=${encodeURIComponent(q)}`);
      if (!advRes.ok) throw new Error(`Advisory API error: ${advRes.status}`);
      const adv = await advRes.json();
      setCity(q);
      setCurrent(cur);
      setForecast(fc);
      setAdvisory(adv);
      addToast(`Weather loaded for ${q}`, "success", 2000);
    } catch (e: any) {
      const errMsg = e?.message || "Could not fetch weather data. Please try again.";
      setError(errMsg);
      addToast(`Error: ${errMsg}`, "error", 3000);
    } finally {
      setLoading(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      const msg = "Geolocation not supported in your browser";
      setError(msg);
      addToast(msg, "warning", 3000);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          // For now, show message; full reverse geocoding would require backend endpoint
          addToast(`Location obtained (${lat.toFixed(2)}, ${lon.toFixed(2)}) - please type city name`, "info", 3000);
          setLoading(false);
        } catch (e: any) {
          const msg = e?.message || "Unable to use location";
          setError(msg);
          addToast(msg, "error", 3000);
          setLoading(false);
        }
      },
      (err) => {
        const msg = err.code === 1 ? "Location permission denied" : "Unable to get your location";
        setError(msg);
        addToast(msg, "error", 3000);
        setLoading(false);
      }
    );
  }

  // Prepare chart data from forecast
  const chartData = forecast.map((d) => ({
    date: new Date(d.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
    temp_max: d.temp_max,
    temp_min: d.temp_min,
    humidity: d.humidity,
  }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <h1 className="text-3xl font-bold">🌤️ Weather & Agri Insights</h1>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 w-full max-w-2xl rounded-xl border border-border/60 bg-background/50 px-3 py-2">
          <Search />
          <input
            className="flex-1 bg-transparent outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city or use your location"
            onKeyDown={(e) => {
              if (e.key === "Enter") searchCity(query);
            }}
          />
          <button className="ml-2 rounded-md bg-accent px-3 py-1 text-sm" onClick={() => searchCity(query)}>
            Search
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm"
            onClick={useMyLocation}
          >
            <LocateFixed /> Use My Location
          </button>
        </div>
      </div>

      {loading ? (
        <section className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <WeatherCardSkeleton />
            <WeatherCardSkeleton />
            <WeatherCardSkeleton />
          </div>
        </section>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-md bg-red-600/10 p-4 text-sm text-red-200">{error}</div>
      ) : null}

      {!current && !loading ? (
        <div className="mt-6 rounded-2xl border border-border/50 bg-card/70 p-6 text-center">
          Enter a city above to see weather conditions and agri advisories
        </div>
      ) : null}

      {current ? (
        <section className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/50 bg-card/70 p-6">
              <div className="text-sm text-foreground/70">
                {city} • {current.country}
              </div>
              <div className="mt-2 text-5xl font-bold">{Math.round(current.temperature)}°C</div>
              <div className="mt-1 text-sm text-foreground/70">{current.condition}</div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  Humidity: <strong>{current.humidity}%</strong>
                </div>
                <div>
                  Feels like: <strong>{current.feels_like}°C</strong>
                </div>
                <div>
                  Wind: <strong>{current.wind_speed} m/s</strong>
                </div>
                <div>
                  UV Index: <strong>{current.uv_index}</strong>
                </div>
              </div>
              <div className="mt-3 text-xs text-foreground/60">Last updated: just now</div>
            </div>

            <div className="md:col-span-2 rounded-2xl border border-border/50 bg-card/70 p-4">
              <h3 className="text-lg font-semibold">7-day Forecast</h3>
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                {forecast.map((d: any) => (
                  <div key={d.date} className="min-w-[120px] rounded-xl border border-border/40 bg-background/50 p-3 text-center">
                    <div className="font-medium">{new Date(d.date).toLocaleDateString(undefined, { weekday: "short" })}</div>
                    <div className="mt-2">
                      {Math.round(d.temp_max)}° / {Math.round(d.temp_min)}°
                    </div>
                    <div className="mt-1 text-sm text-foreground/70">{d.condition}</div>
                    <div className="mt-1 text-sm">Rain: {d.rainfall_mm} mm</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {chartData.length > 0 ? (
            <div className="rounded-2xl border border-border/50 bg-card/70 p-6">
              <h3 className="text-lg font-semibold mb-4">Temperature & Humidity Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#ffffff60" />
                  <YAxis yAxisId="left" stroke="#ffffff60" label={{ value: "Temp (°C)", angle: -90, position: "insideLeft" }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#ffffff60" label={{ value: "Humidity (%)", angle: 90, position: "insideRight" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #ffffff20" }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="temp_max" stroke="#4dd0e1" name="Max Temp" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="temp_min" stroke="#81c784" name="Min Temp" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#ffb74d" name="Humidity %" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </section>
      ) : null}

      {advisory ? (
        <section className="mt-6 rounded-2xl border border-border/50 bg-card/70 p-6">
          <h3 className="text-lg font-semibold">🌾 Agri Advisory for {city}</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <div className={`rounded-full px-4 py-2 text-sm font-medium ${advisory.irrigation_needed ? "bg-blue-600/20 text-blue-300" : "bg-white/5 text-foreground/60"}`}>
              💧 Irrigation: {advisory.irrigation_needed ? "Needed" : "Not needed"}
            </div>
            <div className={`rounded-full px-4 py-2 text-sm font-medium ${advisory.fungal_risk ? "bg-red-600/20 text-red-300" : "bg-green-600/20 text-green-300"}`}>
              🍄 Fungal Risk: {advisory.fungal_risk ? "High" : "Low"}
            </div>
            <div className={`rounded-full px-4 py-2 text-sm font-medium ${advisory.frost_risk ? "bg-purple-600/20 text-purple-300" : "bg-white/5 text-foreground/60"}`}>
              🌡️ Frost Risk: {advisory.frost_risk ? "Yes" : "No"}
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {advisory.advice?.map((a: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"></span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
