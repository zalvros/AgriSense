"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: "emerald" | "amber" | "rose" | "teal";
  delta?: string;
}

const colorStyles = {
  emerald: "from-emerald-500/30 to-emerald-400/10",
  amber: "from-amber-500/30 to-amber-400/10",
  rose: "from-rose-500/30 to-rose-400/10",
  teal: "from-teal-500/30 to-teal-400/10",
};

const colorClasses = {
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  rose: "text-rose-400",
  teal: "text-teal-400",
};

export function StatCard({ label, value, icon: Icon, color, delta }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof value !== "number") return;

    let animationFrameId: number;
    let current = 0;
    const target = value;
    const duration = 800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      current = Math.floor(target * progress);
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  const finalValue = typeof value === "number" ? displayValue : value;

  const isDelta = delta && (delta.startsWith("+") || delta.startsWith("-"));
  const deltaColor = isDelta && delta.startsWith("+") ? "bg-emerald-500/20" : "bg-rose-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 400, damping: 30 }}
      className="rounded-2xl border border-border/50 bg-card/70 p-4 shadow-glass backdrop-blur-glass"
    >
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">{label}</p>
        <div className={`rounded-lg bg-gradient-to-br ${colorStyles[color]} p-2`}>
          <Icon className={`h-5 w-5 ${colorClasses[color]}`} />
        </div>
      </div>

      <p className="mt-4 font-display text-2xl font-semibold text-white/95">{finalValue}</p>

      {delta && (
        <div className={`mt-2 inline-block rounded-full ${deltaColor} px-2 py-1`}>
          <p className="text-xs font-medium text-white/80">{delta}</p>
        </div>
      )}
    </motion.div>
  );
}
