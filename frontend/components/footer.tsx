"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 w-full border-t border-white/5 bg-[rgba(0,0,0,0.5)] text-white/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 text-sm">
        <div>
          <span className="block">Built by <strong>Tushar Joshi</strong></span>
          <a href="mailto:tusharjoshi6611@gmail.com" className="text-white/60 hover:text-white">
            tusharjoshi6611@gmail.com
          </a>
        </div>

        <div className="text-center">
          © 2026 AgriSense. All rights reserved.
        </div>

        <div className="flex items-center gap-3">
          <Link href="#" className="text-sm text-white/50 hover:text-white">Home</Link>
          <span className="text-white/30">·</span>
          <Link href="/mandi" className="text-sm text-white/50 hover:text-white">Crop Prices</Link>
          <span className="text-white/30">·</span>
          <Link href="#prediction" className="text-sm text-white/50 hover:text-white">Weather</Link>
        </div>
      </div>
    </footer>
  );
}
