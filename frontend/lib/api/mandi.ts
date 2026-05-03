import { API_BASE_URL } from "@/lib/api";
import {
  MandiAPIError,
  MandiApiResponse,
  MandiFilters,
  MandiRecord,
  MandiStats,
  RawMandiRecord,
} from "@/lib/types/mandi";

export class MandiError extends Error {
  constructor(
    public message: string,
    public status: number
  ) {
    super(message);
  }
}

export function buildQueryString(filters: MandiFilters): string {
  const params = new URLSearchParams();
  params.append("api-key", "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b");
  params.append("format", "json");
  params.append("limit", filters.limit.toString());

  const offset = (filters.page - 1) * filters.limit;
  params.append("offset", offset.toString());

  if (filters.state) {
    params.append("filters[State]", filters.state);
  }
  if (filters.commodity) {
    params.append("filters[Commodity]", filters.commodity);
  }

  return `?${params.toString()}`;
}

export function parseRecord(raw: RawMandiRecord): MandiRecord {
  return {
    state: raw.State || "",
    district: raw.District || "",
    market: raw.Market || "",
    commodity: raw.Commodity || "",
    variety: raw.Variety || "",
    arrival_date: raw.Arrival_Date || "",
    min_price: parseFloat(raw.Min_x0020_Price) || 0,
    max_price: parseFloat(raw.Max_x0020_Price) || 0,
    modal_price: parseFloat(raw.Modal_x0020_Price) || 0,
  };
}

export async function fetchMandiPrices(
  filters: MandiFilters
): Promise<{ records: MandiRecord[]; total: number }> {
  const BASE = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
  const queryString = buildQueryString(filters);

  try {
    const res = await fetch(`${BASE}${queryString}`);

    if (!res.ok) {
      throw new MandiError(`HTTP ${res.status}: ${res.statusText}`, res.status);
    }

    const data: MandiApiResponse = await res.json();
    const records = data.records.map(parseRecord);

    return { records, total: data.total };
  } catch (err) {
    if (err instanceof MandiError) {
      throw err;
    }
    if (err instanceof TypeError) {
      throw new MandiError("Network error", 0);
    }
    throw new MandiError("Unknown error", 0);
  }
}

export async function fetchCommodities(): Promise<string[]> {
  const BASE = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
  const params = new URLSearchParams();
  params.append("api-key", "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b");
  params.append("format", "json");
  params.append("limit", "1000");

  try {
    const res = await fetch(`${BASE}?${params.toString()}`);
    if (!res.ok) throw new MandiError(`HTTP ${res.status}`, res.status);

    const data: MandiApiResponse = await res.json();
    const commodities = [...new Set(data.records.map((r) => r.Commodity || ""))];
    return commodities.filter(Boolean).sort();
  } catch (err) {
    console.error("Failed to fetch commodities:", err);
    return [];
  }
}

export async function fetchStates(): Promise<string[]> {
  const BASE = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
  const params = new URLSearchParams();
  params.append("api-key", "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b");
  params.append("format", "json");
  params.append("limit", "1000");

  try {
    const res = await fetch(`${BASE}?${params.toString()}`);
    if (!res.ok) throw new MandiError(`HTTP ${res.status}`, res.status);

    const data: MandiApiResponse = await res.json();
    const states = [...new Set(data.records.map((r) => r.State || ""))];
    return states.filter(Boolean).sort();
  } catch (err) {
    console.error("Failed to fetch states:", err);
    return [];
  }
}

export function computeStats(records: MandiRecord[]): MandiStats {
  if (records.length === 0) {
    return {
      avgModalPrice: 0,
      maxModalPrice: 0,
      minModalPrice: 0,
      totalMarkets: 0,
      lastUpdated: "",
    };
  }

  const modalPrices = records.map((r) => r.modal_price);
  const avgModalPrice = Math.round((modalPrices.reduce((a, b) => a + b, 0) / modalPrices.length) * 100) / 100;
  const maxModalPrice = Math.max(...modalPrices);
  const minModalPrice = Math.min(...modalPrices);

  const uniqueMarkets = [...new Set(records.map((r) => r.market))];
  const totalMarkets = uniqueMarkets.length;

  // Get the most recent arrival date
  const dates = records.map((r) => r.arrival_date).filter(Boolean);
  const lastUpdated = dates.length > 0 ? dates.sort().reverse()[0] : "";

  return {
    avgModalPrice,
    maxModalPrice,
    minModalPrice,
    totalMarkets,
    lastUpdated,
  };
}
