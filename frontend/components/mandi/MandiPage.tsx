"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Building2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useEffect } from "react";
import { useMandiStore } from "@/lib/store/useMandiStore";
import { FilterBar } from "./FilterBar";
import { PriceDetailSheet } from "./PriceDetailSheet";
import { PriceTable } from "./PriceTable";
import { StatCard } from "./StatCard";

export function MandiPage() {
  const { fetchDropdowns, fetchPrices, isLoading, error, stats } = useMandiStore();

  useEffect(() => {
    fetchDropdowns();
    fetchPrices();
  }, []);

  const handleRefresh = () => {
    fetchPrices();
  };

  return (
    <main className="min-h-screen pb-16">
      {/* Sticky Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-20 border-b border-white/5 bg-card/40 py-4 backdrop-blur-lg"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-white/95">Live Mandi Prices</h1>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">APMC · Data.gov.in</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-emerald-300">Live</span>
              </div>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="rounded-lg border border-white/10 bg-white/[0.05] p-2 text-white/60 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white/80 disabled:opacity-50"
                title="Refresh prices"
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <FilterBar />
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          {isLoading && !stats ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-border/50 bg-card/70 h-20" />
              ))}
            </>
          ) : (
            <>
              <StatCard
                label="Avg Modal Price"
                value={stats?.avgModalPrice || 0}
                icon={TrendingUp}
                color="emerald"
              />
              <StatCard
                label="Highest Price"
                value={stats?.maxModalPrice || 0}
                icon={ArrowUp}
                color="amber"
              />
              <StatCard
                label="Lowest Price"
                value={stats?.minModalPrice || 0}
                icon={ArrowDown}
                color="rose"
              />
              <StatCard
                label="Markets Listed"
                value={stats?.totalMarkets || 0}
                icon={Building2}
                color="teal"
              />
            </>
          )}
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-rose-400/5 p-4"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-400" />
            <div className="flex-1">
              <p className="font-medium text-rose-300">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-sm font-medium text-rose-300 underline hover:text-rose-200"
              >
                Try again
              </button>
            </div>
          </motion.div>
        )}

        {/* Price Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <PriceTable />
        </motion.div>
      </div>

      {/* Detail Sheet */}
      <PriceDetailSheet />
    </main>
  );
}
