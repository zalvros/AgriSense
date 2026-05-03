import { MandiRecord } from "@/lib/types/mandi";

export function formatINR(amount: number): string {
  if (!Number.isFinite(amount)) return "₹0";

  const isInteger = Number.isInteger(amount);
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: isInteger ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(amount);

  return `₹${formatted}`;
}

export function formatDate(ddmmyyyy: string): string {
  if (!ddmmyyyy || typeof ddmmyyyy !== "string") return "";

  const parts = ddmmyyyy.split("/");
  if (parts.length !== 3) return ddmmyyyy;

  const day = parts[0];
  const month = parseInt(parts[1], 10);
  const year = parts[2];

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthName = months[month - 1] || parts[1];
  return `${day} ${monthName} ${year}`;
}

export function priceChangeColor(modal: number, avg: number): string {
  if (!Number.isFinite(modal) || !Number.isFinite(avg)) return "text-white/70";

  if (avg === 0) return "text-white/70";

  const ratio = modal / avg;

  if (ratio > 1.1) return "text-emerald-400";
  if (ratio < 0.9) return "text-rose-400";
  return "text-white/70";
}

export function getPriceLevel(modal: number, min: number, max: number): number {
  if (max === min) return 50;

  const level = ((modal - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, level));
}

export function generateSparkData(record: MandiRecord): { day: number; price: number }[] {
  // Create a deterministic seed from commodity name
  let seed = 0;
  for (let i = 0; i < record.commodity.length; i++) {
    seed += record.commodity.charCodeAt(i);
  }

  // Seeded pseudo-random number generator
  function seededRandom(s: number): number {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  }

  const basePrice = record.modal_price;
  const variance = basePrice * 0.08; // ±8%

  const data = [];
  for (let day = 1; day <= 7; day++) {
    const randomness = seededRandom(seed + day);
    const offset = (randomness - 0.5) * 2 * variance;
    const price = Math.max(record.min_price, Math.min(record.max_price, basePrice + offset));

    data.push({ day, price: Math.round(price * 100) / 100 });
  }

  return data;
}

export const COMMODITY_EMOJI: Record<string, string> = {
  Rice: "🌾",
  Wheat: "🌾",
  Maize: "🌿",
  Tomato: "🍅",
  Onion: "🧅",
  Potato: "🥔",
  Cotton: "🌱",
  Sugarcane: "🎋",
  Paddy: "🌾",
  Jowar: "🌾",
  Bajra: "🌾",
  "Arhar/Tur": "🌰",
  Moong: "🌿",
  Urad: "🌿",
  Masur: "🌿",
  Gram: "🌰",
  "Sesamum (Til)": "🌰",
  Groundnut: "🌰",
  Soyabean: "🌿",
  "Sunflower (Seed)": "🌻",
  Mustard: "🌾",
  Linseed: "🌾",
  Castor: "🌿",
};

export function getCommodityEmoji(commodity: string): string {
  return COMMODITY_EMOJI[commodity] || "🌿";
}
