"use client";

import { X } from "lucide-react";
import { useMandiStore } from "@/lib/store/useMandiStore";

export function FilterBar() {
  const { state: stateValue, commodity: commodityValue } = useMandiStore((state) => state.filters);
  const { commodities, states, total, setFilter } = useMandiStore();

  const isFiltered = stateValue !== "" || commodityValue !== "";

  const handleClearFilters = async () => {
    if (stateValue !== "") await setFilter("state", "");
    if (commodityValue !== "") await setFilter("commodity", "");
  };

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/70 p-4 shadow-glass backdrop-blur-glass md:flex-row md:items-center md:gap-4">
      {/* State Dropdown */}
      <div className="relative flex-1">
        <label className="mb-1 block text-xs uppercase tracking-wider text-foreground/60">State</label>
        <div className="relative">
          <select
            value={stateValue}
            onChange={(e) => setFilter("state", e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 pr-8 text-sm text-white/80 backdrop-blur-sm transition-all hover:border-white/20 focus:border-emerald-400/50 focus:bg-white/[0.08] focus:outline-none"
          >
            <option value="">All States</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Commodity Dropdown */}
      <div className="relative flex-1">
        <label className="mb-1 block text-xs uppercase tracking-wider text-foreground/60">Commodity</label>
        <div className="relative">
          <select
            value={commodityValue}
            onChange={(e) => setFilter("commodity", e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 pr-8 text-sm text-white/80 backdrop-blur-sm transition-all hover:border-white/20 focus:border-emerald-400/50 focus:bg-white/[0.08] focus:outline-none"
          >
            <option value="">All Commodities</option>
            {commodities.map((commodity) => (
              <option key={commodity} value={commodity}>
                {commodity}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Results count */}
      <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-center">
        <p className="text-xs text-white/60">
          {total.toLocaleString("en-IN")} <span className="text-white/40">records</span>
        </p>
      </div>

      {/* Clear Filters Button */}
      {isFiltered && (
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/60 transition-all hover:bg-white/10 hover:text-white/90"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  );
}
