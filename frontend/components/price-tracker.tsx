"use client";

import { motion } from "framer-motion";
import { Search, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { MarketPrice } from "@/lib/types";
import { PriceSkeleton } from "./skeleton";
import { useToast } from "./toast";

function getTimeAgo(isoString: string): string {
  if (!isoString) return "just now";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  } catch {
    return isoString;
  }
}

export function PriceTracker() {
  const { addToast } = useToast();
  const [query, setQuery] = useState("");
  const [prices, setPrices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [states, setStates] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [summary, setSummary] = useState<any | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  async function loadPrices(q = "") {
    setError(null);
    setLoading(true);
    setSource(null);
    
    // Build URL with proper query params
    const params = new URLSearchParams();
    params.append("limit", "100");
    if (selectedState) params.append("state", selectedState);
    if (selectedCommodity) params.append("commodity", selectedCommodity);
    
    const endpoint = `${API_BASE_URL}/api/prices?${params.toString()}`;

    let attempt = 0;
    let lastErr: any = null;
    const delays = [500, 1000, 2000];

    while (attempt < 3) {
      try {
        const res = await fetch(endpoint);
        if (!res.ok) {
          const errText = await res.text();
          let errMsg = "Request failed";
          try {
            const errData = JSON.parse(errText);
            errMsg = errData?.detail || errData?.error || errMsg;
          } catch {
            errMsg = errText || `HTTP ${res.status}`;
          }
          throw new Error(errMsg);
        }
        const data = await res.json();

        const dataSource = res.headers.get("x-data-source") || data.source || "live";
        const fetchedAtHeader = res.headers.get("x-fetched-at") || data.fetched_at;
        
        setFetchedAt(fetchedAtHeader);
        setSource(dataSource);
        setPrices(data.records || []);
        setLoading(false);
        if (dataSource === "live") {
          addToast(`Loaded ${data.records?.length || 0} live prices`, "success", 2000);
        } else if (dataSource === "cache") {
          addToast(`Showing cached prices from ${getTimeAgo(fetchedAtHeader)}`, "info", 2000);
        } else {
          addToast("Showing mock/fallback prices", "warning", 3000);
        }
        return;
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, delays[attempt]));
        attempt += 1;
      }
    }

    setLoading(false);
    const errorMsg = lastErr instanceof Error ? lastErr.message : String(lastErr);
    setError(errorMsg);
    addToast(`Failed to load prices: ${errorMsg}`, "error", 4000);
    
    // fallback: try to load mock from same endpoint without throwing
    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setSource(res.headers.get("x-data-source") || data.source || "mock");
        setPrices(data.records || []);
        addToast("Showing fallback mock data", "warning", 3000);
      }
    } catch {
      // ignore fallback attempt
    }
  }

  useEffect(() => {
    loadPrices();
    // load filters and summary
    fetch(`${API_BASE_URL}/api/prices/states`).then((r) => r.json()).then((d) => setStates(d.states || [])).catch(() => {});
    fetch(`${API_BASE_URL}/api/prices/commodities`).then((r) => r.json()).then((d) => setCommodities(d.commodities || [])).catch(() => {});
    fetch(`${API_BASE_URL}/api/prices/summary`).then((r) => r.json()).then((d) => setSummary(d)).catch(() => {});
  }, []);

  // Reload prices when filters change
  useEffect(() => {
    if (selectedState || selectedCommodity) {
      loadPrices();
    }
  }, [selectedState, selectedCommodity]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl border border-border/50 bg-card/70 p-6 shadow-glass backdrop-blur-glass"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Live Crop Prices</h2>
          <p className="text-sm text-foreground/70">Mock JSON scaffold, ready for future Govt/Agri API integration.</p>
        </div>

        <div className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-border/60 bg-background/50 px-3 py-2 sm:w-auto">
          <Search size={15} className="text-foreground/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") loadPrices(query);
            }}
            placeholder="Search crop or market"
            className="w-full bg-transparent text-sm outline-none"
          />
          <button className="text-xs font-semibold" onClick={() => loadPrices(query)} type="button">
            Go
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex w-full max-w-2xl items-center gap-2">
          <div className="flex items-center gap-2 w-full max-w-sm rounded-xl border border-border/60 bg-background/50 px-3 py-2">
            <Search size={15} className="text-foreground/60" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter crop or market"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <select value={selectedState} onChange={(e) => { setSelectedState(e.target.value); }} className="rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm">
            <option value="">All States</option>
            {states.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>

          <select value={selectedCommodity} onChange={(e) => { setSelectedCommodity(e.target.value); }} className="rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm">
            <option value="">All Commodities</option>
            {commodities.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm"
            onClick={() => {
              addToast("Clearing cache and refreshing...", "info", 1500);
              fetch(`${API_BASE_URL}/api/admin/clear-cache`, { method: "POST" }).finally(() => loadPrices(query));
            }}
            title="Refresh"
          >
            <RefreshCw /> Refresh
          </button>
        </div>
      </div>

      {summary ? (
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-border/50 bg-card/60 p-3 text-sm">
            <div className="text-foreground/70">AVG MODAL PRICE</div>
            <div className="mt-2 text-lg font-semibold">INR {Number(summary.avg_modal_price).toLocaleString()}</div>
          </div>
          <div className="rounded-lg border border-border/50 bg-card/60 p-3 text-sm">
            <div className="text-foreground/70">HIGHEST PRICE</div>
            <div className="mt-2 text-lg font-semibold">INR {Number(summary.highest_price).toLocaleString()}</div>
          </div>
          <div className="rounded-lg border border-border/50 bg-card/60 p-3 text-sm">
            <div className="text-foreground/70">LOWEST PRICE</div>
            <div className="mt-2 text-lg font-semibold">INR {Number(summary.lowest_price).toLocaleString()}</div>
          </div>
          <div className="rounded-lg border border-border/50 bg-card/60 p-3 text-sm">
            <div className="text-foreground/70">MARKETS LISTED</div>
            <div className="mt-2 text-lg font-semibold">{summary.markets_listed}</div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 text-foreground/70">
              <th className="px-2 py-2 font-medium">Crop</th>
              <th className="px-2 py-2 font-medium">Variety</th>
              <th className="px-2 py-2 font-medium">Market</th>
              <th className="px-2 py-2 font-medium">State</th>
              <th className="px-2 py-2 font-medium">Min</th>
              <th className="px-2 py-2 font-medium">Modal</th>
              <th className="px-2 py-2 font-medium">Max</th>
              <th className="px-2 py-2 font-medium">Trend</th>
              <th className="px-2 py-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                <PriceSkeleton />
                <PriceSkeleton />
                <PriceSkeleton />
                <PriceSkeleton />
                <PriceSkeleton />
              </>
            ) : (prices || [])
              .filter((row) => {
                if (!searchTerm) return true;
                const s = searchTerm.toLowerCase();
                return (
                  String(row.commodity || row.crop || "").toLowerCase().includes(s) ||
                  String(row.market || "").toLowerCase().includes(s)
                );
              })
              .map((row: any, idx) => (
                <tr key={`${row.commodity || row.crop}-${idx}`} className="border-b border-border/40">
                  <td className="px-2 py-2">{row.commodity || row.crop}</td>
                  <td className="px-2 py-2">{row.variety || "-"}</td>
                  <td className="px-2 py-2">{row.market}</td>
                  <td className="px-2 py-2">{row.state}</td>
                  <td className="px-2 py-2">INR {row.min_price}</td>
                  <td className="px-2 py-2">INR {row.modal_price}</td>
                  <td className="px-2 py-2">INR {row.max_price}</td>
                  <td className="px-2 py-2">
                    {row.trend === "Up" || row.trend === "up" ? (
                      <span className="rounded-full bg-green-600/20 px-2 py-1 text-green-300">🟢 Up</span>
                    ) : row.trend === "Down" || row.trend === "down" ? (
                      <span className="rounded-full bg-red-600/20 px-2 py-1 text-red-300">🔴 Down</span>
                    ) : (
                      <span className="rounded-full bg-amber-600/20 px-2 py-1 text-amber-300">🟡 Stable</span>
                    )}
                  </td>
                  <td className="px-2 py-2">{row.price_date || row.updatedAt || ""}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {source && source !== "live" ? (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-600/10 px-3 py-2 text-sm text-amber-200">
          <span>⚠️ Data from <span className="font-mono font-semibold capitalize">{source}</span> source</span>
          {fetchedAt && <span className="ml-1 text-amber-300/70">• {getTimeAgo(fetchedAt)}</span>}
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </motion.section>
  );
}
