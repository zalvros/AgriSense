"use client";

import { motion } from "framer-motion";
import { CloudSun, Leaf, MapPin } from "lucide-react";
import { WeatherResponse } from "@/lib/types";
import { DashboardCardSkeleton } from "./skeleton";

type DashboardProps = {
  weather: WeatherResponse | null;
  savedCount: number;
  latestCrop: string | null;
  isLoading?: boolean;
};

export function Dashboard({ weather, savedCount, latestCrop, isLoading }: DashboardProps) {
  if (isLoading) {
    return (
      <section className="grid gap-4 md:grid-cols-3">
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
      </section>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-border/50 bg-card/70 p-5 shadow-glass backdrop-blur-glass"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">Local Weather</p>
        <div className="mt-3 flex items-center gap-3">
          <CloudSun className="text-accent" />
          <div>
            <p className="text-xl font-semibold">{weather ? `${weather.temperature}°C` : "-"}</p>
            <p className="text-sm text-foreground/70">
              {weather ? `${weather.city}, ${weather.country}` : "Search weather to update"}
            </p>
          </div>
        </div>
      </motion.article>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-border/50 bg-card/70 p-5 shadow-glass backdrop-blur-glass"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">Saved Recommendations</p>
        <div className="mt-3 flex items-center gap-3">
          <Leaf className="text-accent" />
          <div>
            <p className="text-xl font-semibold">{savedCount}</p>
            <p className="text-sm text-foreground/70">Stored locally in this browser</p>
          </div>
        </div>
      </motion.article>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl border border-border/50 bg-card/70 p-5 shadow-glass backdrop-blur-glass"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">Latest Crop</p>
        <div className="mt-3 flex items-center gap-3">
          <MapPin className="text-accent" />
          <div>
            <p className="text-xl font-semibold">{latestCrop || "No prediction yet"}</p>
            <p className="text-sm text-foreground/70">Most recent recommendation</p>
          </div>
        </div>
      </motion.article>
    </section>
  );
}
