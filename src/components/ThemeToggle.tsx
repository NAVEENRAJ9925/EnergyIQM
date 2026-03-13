import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? theme !== "light" : true;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/60 shadow-sm backdrop-blur transition-colors hover:bg-card"
      aria-label="Toggle theme"
    >
      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100 bg-gradient-to-br from-[hsl(var(--accent))/0.18] via-transparent to-[hsl(var(--primary))/0.14]" />
      {isDark ? (
        <Sun className="relative h-4 w-4 text-amber-300" />
      ) : (
        <Moon className="relative h-4 w-4 text-slate-600" />
      )}
    </button>
  );
}

