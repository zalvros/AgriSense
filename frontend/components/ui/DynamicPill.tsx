"use client";

import { motion } from "framer-motion";
import { TrendingUp, Cloud } from "lucide-react";
import Link from "next/link";

export function DynamicPill() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 400, damping: 30 }}
      className="fixed top-4 left-1/2 z-40 -translate-x-1/2 px-4"
    >
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-card/40 px-4 py-2 shadow-glass backdrop-blur-glass">
        {/* Prices Link */}
        <Link
          href="/mandi"
          className="flex items-center gap-1.5 text-xs text-white/60 transition-colors hover:text-white/90"
          title="Live Mandi Prices"
        >
          <TrendingUp className="h-4 w-4" />
          <span>Prices</span>
        </Link>

        {/* Divider */}
        <div className="h-4 w-px bg-white/10" />

        {/* Weather Chip */}
        <div className="flex items-center gap-1.5 text-xs text-white/60">
          <Cloud className="h-4 w-4" />
          <span>Weather</span>
        </div>
      </div>
    </motion.div>
  );
}
