"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Dashboard } from "@/components/dashboard";
import { PredictionForm } from "@/components/prediction-form";
import { PriceTracker } from "@/components/price-tracker";
import { ResultCard } from "@/components/result-card";
import { API_BASE_URL } from "@/lib/api";
import { PredictionResponse, WeatherResponse } from "@/lib/types";

const STORAGE_KEY = "saved-crop-recommendations";

export default function HomePage() {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [saved, setSaved] = useState<PredictionResponse[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      setSaved(JSON.parse(raw));
    } catch {
      setSaved([]);
    }
  }, []);

  function handlePrediction(next: PredictionResponse) {
    setResult(next);
    setSaved((prev) => {
      const updated = [next, ...prev].slice(0, 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  const latestCrop = useMemo(() => saved[0]?.recommendedCrop || result?.recommendedCrop || null, [saved, result]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        id="home"
        className="mb-8 rounded-3xl border border-border/60 bg-card/60 p-6 shadow-glass backdrop-blur-glass"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">AI-Powered Agriculture</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight md:text-5xl">AgriSense</h1>
            <p className="mt-3 max-w-2xl text-sm text-foreground/75 md:text-base">
              Analyze soil, auto-fetch climate signals, predict the best crop, and monitor live market trends from one fluid interface.
            </p>
            <p className="mt-2 text-xs text-foreground/60">Backend API: {API_BASE_URL}</p>
          </div>
          {/* Theme toggle moved to top navbar */}
        </div>
      </motion.header>

      <section className="space-y-6">
        <div id="stats">
          <Dashboard weather={weather} savedCount={saved.length} latestCrop={latestCrop} />
        </div>

        <div id="prediction">
          <PredictionForm onWeatherLoaded={setWeather} onPredicted={handlePrediction} />
        </div>
        {result ? <ResultCard result={result} /> : null}
        <div id="prices">
          <PriceTracker />
        </div>
      </section>
    </main>
  );
}
