import { create } from "zustand";
import {
  computeStats,
  fetchCommodities,
  fetchMandiPrices,
  fetchStates,
  MandiError,
} from "@/lib/api/mandi";
import { MandiFilters, MandiRecord, MandiStats } from "@/lib/types/mandi";

interface MandiStoreState {
  records: MandiRecord[];
  total: number;
  isLoading: boolean;
  error: string | null;
  filters: MandiFilters;
  stats: MandiStats | null;
  commodities: string[];
  states: string[];
  selectedRecord: MandiRecord | null;
}

interface MandiStoreActions {
  fetchPrices: () => Promise<void>;
  fetchDropdowns: () => Promise<void>;
  setFilter: (key: keyof Omit<MandiFilters, "page">, value: string) => Promise<void>;
  setPage: (page: number) => Promise<void>;
  setSortBy: (col: MandiFilters["sortBy"], dir: MandiFilters["sortDir"]) => void;
  setSelectedRecord: (record: MandiRecord | null) => void;
}

const initialFilters: MandiFilters = {
  state: "",
  commodity: "",
  sortBy: "arrival_date",
  sortDir: "desc",
  page: 1,
  limit: 20,
};

export const useMandiStore = create<MandiStoreState & MandiStoreActions>((set, get) => ({
  records: [],
  total: 0,
  isLoading: false,
  error: null,
  filters: initialFilters,
  stats: null,
  commodities: [],
  states: [],
  selectedRecord: null,

  fetchPrices: async () => {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      const { records, total } = await fetchMandiPrices(state.filters);
      const stats = computeStats(records);

      set({ records, total, stats, error: null });
    } catch (err) {
      const message = err instanceof MandiError ? err.message : "Failed to fetch prices";
      set({ error: message, records: [], stats: null });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDropdowns: async () => {
    try {
      const [commodities, states] = await Promise.all([fetchCommodities(), fetchStates()]);
      set({ commodities, states });
    } catch (err) {
      console.error("Failed to fetch dropdowns:", err);
    }
  },

  setFilter: async (key, value) => {
    const filters = { ...get().filters, [key]: value, page: 1 };
    set({ filters });

    // Immediately fetch with new filter
    try {
      set({ isLoading: true, error: null });
      const { records, total } = await fetchMandiPrices(filters);
      const stats = computeStats(records);
      set({ records, total, stats, error: null });
    } catch (err) {
      const message = err instanceof MandiError ? err.message : "Failed to fetch prices";
      set({ error: message, records: [], stats: null });
    } finally {
      set({ isLoading: false });
    }
  },

  setPage: async (page) => {
    const filters = { ...get().filters, page };
    set({ filters });

    try {
      set({ isLoading: true, error: null });
      const { records, total } = await fetchMandiPrices(filters);
      const stats = computeStats(records);
      set({ records, total, stats, error: null });
    } catch (err) {
      const message = err instanceof MandiError ? err.message : "Failed to fetch prices";
      set({ error: message, records: [], stats: null });
    } finally {
      set({ isLoading: false });
    }
  },

  setSortBy: (col, dir) => {
    const state = get();
    const sorted = [...state.records].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (col) {
        case "modal_price":
          aVal = a.modal_price;
          bVal = b.modal_price;
          break;
        case "arrival_date":
          aVal = a.arrival_date;
          bVal = b.arrival_date;
          break;
        case "commodity":
          aVal = a.commodity;
          bVal = b.commodity;
          break;
        case "market":
          aVal = a.market;
          bVal = b.market;
          break;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return dir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return dir === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });

    set({ records: sorted, filters: { ...state.filters, sortBy: col, sortDir: dir } });
  },

  setSelectedRecord: (record) => {
    set({ selectedRecord: record });
  },
}));
