"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PredictionResponse } from "@/lib/types";

type ResultCardProps = {
  result: PredictionResponse;
};

export function ResultCard({ result }: ResultCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid gap-5 rounded-2xl border border-border/50 bg-card/70 p-6 shadow-glass backdrop-blur-glass lg:grid-cols-[240px_1fr]"
    >
      <div className="relative h-56 overflow-hidden rounded-xl border border-border/50">
        <Image
          src={result.imageUrl}
          alt={result.recommendedCrop}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-foreground/60">Result</p>
        <h3 className="mt-2 text-3xl font-bold">{result.recommendedCrop}</h3>
        <p className="mt-2 text-foreground/75">
          The model selected this crop based on your soil nutrients and climate inputs.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-border/60 bg-background/55 p-3">
            <p className="text-xs uppercase tracking-wide text-foreground/60">Season</p>
            <p className="mt-1 text-sm font-medium">{result.guide.season}</p>
          </article>
          <article className="rounded-xl border border-border/60 bg-background/55 p-3">
            <p className="text-xs uppercase tracking-wide text-foreground/60">Soil</p>
            <p className="mt-1 text-sm font-medium">{result.guide.soil}</p>
          </article>
          <article className="rounded-xl border border-border/60 bg-background/55 p-3">
            <p className="text-xs uppercase tracking-wide text-foreground/60">Tips</p>
            <p className="mt-1 text-sm font-medium">{result.guide.tips}</p>
          </article>
        </div>
      </div>
    </motion.section>
  );
}
