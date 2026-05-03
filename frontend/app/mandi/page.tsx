import { Metadata } from "next";
import { MandiPage } from "@/components/mandi/MandiPage";

export const metadata: Metadata = {
  title: "Live Mandi Prices — AgriSense",
  description: "Real-time agricultural commodity prices from APMC mandis across India",
};

export default function MandiFarmersMarketPage() {
  return <MandiPage />;
}
