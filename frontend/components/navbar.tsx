"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Leaf, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/" || pathname === "";
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-[rgba(255,255,255,0.03)] border-b border-white/5 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <Leaf className="h-5 w-5 text-emerald-300" />
            <span>AgriSense</span>
          </Link>
        </div>

        <div className="hidden md:flex md:items-center md:gap-6">
          <Link
            href="/"
            className={"flex items-center gap-2 px-3 py-1 rounded-md text-sm transition " +
              (isActive("/") ? "bg-amber-500/10 text-amber-400" : "text-white/70 hover:text-white")}
          >
            <span>🏠</span>
            <span>Home</span>
          </Link>

          <Link
            href="/mandi"
            className={"flex items-center gap-2 px-3 py-1 rounded-md text-sm transition " +
              (isActive("/mandi") ? "bg-amber-500/10 text-amber-400" : "text-white/70 hover:text-white")}
          >
            <span>📈</span>
            <span>Crop Prices</span>
          </Link>

          <a
            href="#prediction"
            className="flex items-center gap-2 px-3 py-1 rounded-md text-sm text-white/70 hover:text-white"
          >
            <span>🌤️</span>
            <span>Weather</span>
          </a>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-white/80"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            type="button"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="md:hidden border-t border-white/5 bg-card/70 px-4 py-3">
          <div className="flex flex-col gap-2">
            <Link href="/" onClick={() => setOpen(false)} className="px-2 py-2 text-sm text-white/80">
              🏠 Home
            </Link>
            <Link href="/mandi" onClick={() => setOpen(false)} className="px-2 py-2 text-sm text-white/80">
              📈 Crop Prices
            </Link>
            <a href="#prediction" onClick={() => setOpen(false)} className="px-2 py-2 text-sm text-white/80">
              🌤️ Weather
            </a>
            <div className="pt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
