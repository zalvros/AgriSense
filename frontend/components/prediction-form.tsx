"use client";

import { motion } from "framer-motion";
import { LocateFixed, Search } from "lucide-react";
import { useState } from "react";
import { fetchWeatherByCity, fetchWeatherByCoords, predictCrop } from "@/lib/api";
import { PredictionInput, PredictionResponse, WeatherResponse } from "@/lib/types";

type PredictionFormProps = {
  onWeatherLoaded: (weather: WeatherResponse) => void;
  onPredicted: (result: PredictionResponse) => void;
};

const initialState: PredictionInput = {
  N: 90,
  P: 42,
  K: 43,
  temperature: 25,
  humidity: 70,
  ph: 6.5,
  rainfall: 120,
};

export function PredictionForm({ onWeatherLoaded, onPredicted }: PredictionFormProps) {
  const [formData, setFormData] = useState<PredictionInput>(initialState);
  const [city, setCity] = useState("Mumbai");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onChange<K extends keyof PredictionInput>(key: K, value: string) {
    setFormData((prev) => ({ ...prev, [key]: Number(value) }));
  }

  async function handleWeatherSearch() {
    try {
      setError(null);
      const data = await fetchWeatherByCity(city);
      onWeatherLoaded(data);
      setFormData((prev) => ({
        ...prev,
        temperature: data.temperature ?? prev.temperature,
        humidity: data.humidity ?? prev.humidity,
        rainfall: data.rainfallLast3Hours ?? prev.rainfall,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Weather search failed");
    }
  }

  async function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const weather = await fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
          onWeatherLoaded(weather);
          setFormData((prev) => ({
            ...prev,
            temperature: weather.temperature ?? prev.temperature,
            humidity: weather.humidity ?? prev.humidity,
            rainfall: weather.rainfallLast3Hours ?? prev.rainfall,
          }));
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unable to fetch weather for current location");
        }
      },
      () => setError("Unable to access your location."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const result = await predictCrop(formData);
      onPredicted(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border/50 bg-card/70 p-6 shadow-glass backdrop-blur-glass"
    >
      <h2 className="text-xl font-semibold">Prediction Form</h2>
      <p className="mt-1 text-sm text-foreground/70">Use weather search or geolocation to auto-fill temperature and humidity.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-xl border border-border/60 bg-background/50 px-4 py-2 outline-none focus:ring-2 focus:ring-accent/40"
          placeholder="Search weather by city"
        />
        <button
          onClick={handleWeatherSearch}
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/60 px-4 py-2 text-sm font-medium"
        >
          <Search size={15} /> Search Weather
        </button>
        <button
          onClick={useMyLocation}
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/60 px-4 py-2 text-sm font-medium"
        >
          <LocateFixed size={15} /> Use My Location
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["N", "Nitrogen"],
            ["P", "Phosphorus"],
            ["K", "Potassium"],
            ["temperature", "Temperature (°C)"],
            ["humidity", "Humidity (%)"],
            ["ph", "pH"],
            ["rainfall", "Rainfall (mm)"],
          ] as [keyof PredictionInput, string][]
        ).map(([key, label]) => (
          <label key={key} className="space-y-1 text-sm">
            <span className="text-foreground/80">{label}</span>
            <input
              type="number"
              step="0.01"
              value={formData[key]}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-background/50 px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40"
            />
          </label>
        ))}

        <div className="sm:col-span-2 lg:col-span-4">
          <button
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-70"
            type="submit"
          >
            {loading ? "Running model..." : "Recommend Crop"}
          </button>
        </div>
      </form>

      {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </motion.section>
  );
}
