"use client";

import { motion } from "framer-motion";
import { ChevronDown, ChevronsUpDown, ChevronUp, Leaf, TrendingDown, TrendingUp } from "lucide-react";
import { useRef } from "react";
import { useMandiStore } from "@/lib/store/useMandiStore";
import { MandiFilters } from "@/lib/types/mandi";
import { formatINR, formatDate, priceChangeColor } from "@/lib/utils/mandiHelpers";
import { PriceTrendChart } from "./PriceTrendChart";

export function PriceTable() {
  const { records, isLoading, stats, filters, setSortBy, setSelectedRecord, setPage } = useMandiStore();
  const hasAnimatedRef = useRef(false);

  const totalPages = Math.ceil((useMandiStore((s) => s.total) || 0) / filters.limit);

  const getSortIcon = (col: MandiFilters["sortBy"]) => {
    if (filters.sortBy === col) {
      return filters.sortDir === "asc" ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      );
    }
    return <ChevronsUpDown className="h-3 w-3 text-white/30" />;
  };

  const handleSort = (col: MandiFilters["sortBy"]) => {
    const newDir = filters.sortBy === col && filters.sortDir === "asc" ? "desc" : "asc";
    setSortBy(col, newDir);
  };

  // Generate page numbers to display
  const pageNumbers = [];
  const start = Math.max(1, filters.page - 2);
  const end = Math.min(totalPages, filters.page + 2);

  for (let i = start; i <= end; i++) {
    pageNumbers.push(i);
  }

  if (isLoading && records.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/70 shadow-glass">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-card/40 backdrop-blur-sm">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-white/60">Commodity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-white/60">Market</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-white/60">State</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-white/60">Modal ₹</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-white/60">Trend</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(8)].map((_, i) => (
              <tr key={i} className="border-b border-white/5">
                <td colSpan={5} className="px-4 py-3">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 rounded-lg bg-white/10" />
                    <div className="h-3 w-2/3 rounded-lg bg-white/5" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/70 py-16 shadow-glass">
        <Leaf className="mb-4 h-10 w-10 text-white/20" />
        <p className="text-lg font-semibold text-white/80">No records found</p>
        <p className="mt-1 text-sm text-white/40">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/70 shadow-glass backdrop-blur-glass">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-card/40">
                <th className="whitespace-nowrap px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("commodity")}
                    className="flex items-center gap-1 text-xs font-semibold uppercase text-white/60 transition-colors hover:text-white/80"
                  >
                    Commodity {getSortIcon("commodity")}
                  </button>
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("market")}
                    className="flex items-center gap-1 text-xs font-semibold uppercase text-white/60 transition-colors hover:text-white/80"
                  >
                    Market {getSortIcon("market")}
                  </button>
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-white/60">
                  State
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase text-white/60">
                  Min ₹
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase text-white/60">
                  Max ₹
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort("modal_price")}
                    className="flex items-center justify-end gap-1 text-xs font-semibold uppercase text-white/60 transition-colors hover:text-white/80"
                  >
                    Modal ₹ {getSortIcon("modal_price")}
                  </button>
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase text-white/60">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, idx) => {
                const priceColor = stats ? priceChangeColor(record.modal_price, stats.avgModalPrice) : "text-white/70";
                const isPriceHigh = stats && record.modal_price > stats.avgModalPrice * 1.1;
                const isPriceLow = stats && record.modal_price < stats.avgModalPrice * 0.9;

                return (
                  <motion.tr
                    key={`${record.commodity}-${record.market}-${idx}`}
                    initial={hasAnimatedRef.current ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: hasAnimatedRef.current ? 0 : idx * 0.03,
                    }}
                    onAnimationComplete={() => {
                      if (!hasAnimatedRef.current) hasAnimatedRef.current = true;
                    }}
                    onClick={() => setSelectedRecord(record)}
                    className="border-b border-white/5 transition-colors hover:cursor-pointer hover:bg-white/[0.04]"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-white/90">{record.commodity}</div>
                      <div className="text-xs text-white/40">{record.variety}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-white/70">{record.market}</div>
                      <div className="text-xs text-white/40">{record.district}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-block rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-white/60">
                        {record.state}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-white/50">{formatINR(record.min_price)}</td>
                    <td className="px-4 py-3 text-right text-sm text-white/50">{formatINR(record.max_price)}</td>
                    <td className={`px-4 py-3 text-right text-sm font-bold ${priceColor}`}>
                      <div className="flex items-center justify-end gap-1.5">
                        <span>{formatINR(record.modal_price)}</span>
                        {isPriceHigh && <TrendingUp className="h-4 w-4 text-emerald-400" />}
                        {isPriceLow && <TrendingDown className="h-4 w-4 text-rose-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PriceTrendChart record={record} />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          onClick={() => setPage(filters.page - 1)}
          disabled={filters.page === 1}
          className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/60 transition-all hover:enabled:border-white/20 hover:enabled:bg-white/10 hover:enabled:text-white/80 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        <div className="flex gap-1">
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => setPage(page)}
              className={`min-w-[2.5rem] rounded-lg px-3 py-2 text-xs transition-all ${
                filters.page === page
                  ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-300 font-medium"
                  : "border border-white/10 bg-white/[0.05] text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPage(filters.page + 1)}
          disabled={filters.page >= totalPages}
          className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/60 transition-all hover:enabled:border-white/20 hover:enabled:bg-white/10 hover:enabled:text-white/80 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {/* Page info */}
      <div className="mt-3 text-center text-xs text-white/40">
        Page {filters.page} of {totalPages}
      </div>
    </div>
  );
}
