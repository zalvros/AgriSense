export interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string; // "DD/MM/YYYY" from API
  min_price: number; // ₹ per quintal
  max_price: number;
  modal_price: number;
}

export interface MandiApiResponse {
  total: number;
  count: number;
  offset: number;
  records: RawMandiRecord[];
}

export interface RawMandiRecord {
  State: string;
  District: string;
  Market: string;
  Commodity: string;
  Variety: string;
  Arrival_Date: string;
  Min_x0020_Price: string;
  Max_x0020_Price: string;
  Modal_x0020_Price: string;
}

export interface MandiFilters {
  state: string; // "" = all
  commodity: string; // "" = all
  sortBy: "modal_price" | "arrival_date" | "commodity" | "market";
  sortDir: "asc" | "desc";
  page: number;
  limit: number; // 20 per page
}

export interface MandiStats {
  avgModalPrice: number;
  maxModalPrice: number;
  minModalPrice: number;
  totalMarkets: number;
  lastUpdated: string;
}

export interface MandiAPIError {
  message: string;
  status: number;
}
