"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme("dark")}
      className="w-8 h-8 border border-white/20 hover:border-white hover:bg-gray-800 hover:text-white transition-all duration-300 flex items-center justify-center group rounded-sm"
    >
      <Sun className="w-3 h-3 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute w-3 h-3 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
