"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const activeTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <button
      onClick={() => setTheme(activeTheme === "dark" ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-sm font-medium shadow-glass backdrop-blur-glass transition hover:scale-[1.02]"
      aria-label="Toggle light and dark mode"
      type="button"
    >
      {activeTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      {activeTheme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
