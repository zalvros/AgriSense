"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Building2,
  Calendar,
  Info,
  MapPin,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useMandiStore } from "@/lib/store/useMandiStore";
import { MandiRecord } from "@/lib/types/mandi";
import {
  formatDate,
  formatINR,
  generateSparkData,
  getCommodityEmoji,
  getPriceLevel,
} from "@/lib/utils/mandiHelpers";

export function PriceDetailSheet() {
  const { selectedRecord, setSelectedRecord, stats } = useMandiStore();

  if (!selectedRecord || !stats) return null;

  const priceLevel = getPriceLevel(selectedRecord.modal_price, selectedRecord.min_price, selectedRecord.max_price);
  const sparkData = generateSparkData(selectedRecord);
  const modalAboveAvg = selectedRecord.modal_price > stats.avgModalPrice;

  return (
    <>
      {/* Backdrop */}
      {selectedRecord && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedRecord(null)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
      )}

      {/* Sheet Container */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl border border-t-white/20 border-x-white/20 bg-card/95 shadow-glass backdrop-blur-glass"
      >
        {/* Drag Handle */}
        <div className="sticky top-0 flex justify-center bg-gradient-to-b from-card/95 to-card/80 py-3">
          <div className="h-1 w-9 rounded-full bg-white/20" />
        </div>

        <div className="space-y-6 px-6 pb-8 pt-4">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-4xl">{getCommodityEmoji(selectedRecord.commodity)}</div>
                <h2 className="font-display text-2xl font-bold text-white/95">{selectedRecord.commodity}</h2>
                <p className="text-sm text-white/50">{selectedRecord.variety}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/60">
                {selectedRecord.market}
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/60">
                {selectedRecord.state}
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-rose-400/5 p-3">
              <p className="text-xs uppercase tracking-wider text-rose-300/70">Min Price</p>
              <p className="mt-2 font-display text-xl font-semibold text-rose-200">
                {formatINR(selectedRecord.min_price)}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-400/5 p-3">
              <p className="text-xs uppercase tracking-wider text-emerald-300/70">Modal Price</p>
              <p className="mt-2 font-display text-xl font-semibold text-emerald-200">
                {formatINR(selectedRecord.modal_price)}
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-400/5 p-3">
              <p className="text-xs uppercase tracking-wider text-amber-300/70">Max Price</p>
              <p className="mt-2 font-display text-xl font-semibold text-amber-200">
                {formatINR(selectedRecord.max_price)}
              </p>
            </div>
          </div>

          {/* Price Position */}
          <div>
            <p className="text-xs uppercase tracking-wider text-white/40">Price position in range</p>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-xs text-white/40">
                <span>{formatINR(selectedRecord.min_price)}</span>
                <span>{formatINR(selectedRecord.max_price)}</span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${priceLevel}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <p className="text-xs uppercase tracking-wider text-white/40">Estimated trend</p>
              <div className="group relative cursor-help">
                <Info className="h-3 w-3 text-white/30" />
                <div className="absolute bottom-full left-0 mb-2 hidden w-48 rounded-lg border border-white/10 bg-card/90 p-2 text-xs text-white/60 group-hover:block">
                  Synthetic trend based on current price
                </div>
              </div>
            </div>
            <div className="h-24 rounded-xl border border-white/10 bg-white/[0.02]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" hide stroke="none" />
                  <YAxis hide domain={["dataMin", "dataMax"]} stroke="none" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(30, 30, 46, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value) => [formatINR(Number(value)), "Price"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#34d399"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Market Info */}
          <div className="space-y-3 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-white/40" />
                <p className="text-sm text-white/60">Arrival Date</p>
              </div>
              <p className="font-medium text-white/90">{formatDate(selectedRecord.arrival_date)}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-white/40" />
                <p className="text-sm text-white/60">Market</p>
              </div>
              <p className="font-medium text-white/90">{selectedRecord.market}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-white/40" />
                <p className="text-sm text-white/60">District</p>
              </div>
              <p className="font-medium text-white/90">{selectedRecord.district}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-white/40" />
                <p className="text-sm text-white/60">State</p>
              </div>
              <p className="font-medium text-white/90">{selectedRecord.state}</p>
            </div>
          </div>

          {/* Comparison with Average */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center gap-2">
              {modalAboveAvg ? (
                <ArrowUp className="h-4 w-4 text-emerald-400" />
              ) : (
                <ArrowDown className="h-4 w-4 text-rose-400" />
              )}
              <p className="text-sm font-medium text-white/80">Price Comparison</p>
            </div>
            <p className="text-xs text-white/60">
              This modal price is{" "}
              <span className={modalAboveAvg ? "font-bold text-emerald-300" : "font-bold text-rose-300"}>
                {modalAboveAvg ? "above" : "below"}
              </span>{" "}
              the average by{" "}
              <span className="font-semibold">
                {formatINR(Math.abs(selectedRecord.modal_price - stats.avgModalPrice))}
              </span>
            </p>
          </div>

          {/* Source Info */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-white/40" />
              <p className="text-xs text-white/50">
                Data sourced from APMC mandis via{" "}
                <span className="font-medium text-white/60">Data.gov.in</span>. Prices are per quintal (100 kg).
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setSelectedRecord(null)}
            className="w-full rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 px-4 py-3 font-medium text-emerald-300 transition-all hover:border-emerald-400/50 hover:bg-emerald-500/15"
          >
            Close
          </button>
        </div>
      </motion.div>
    </>
  );
}
