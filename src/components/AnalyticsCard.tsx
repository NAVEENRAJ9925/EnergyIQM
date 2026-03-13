import { cn } from "@/lib/utils";

export function AnalyticsCard({
  className,
  children,
  accent = "emerald",
}: {
  className?: string;
  children: React.ReactNode;
  accent?: "emerald" | "sky" | "amber" | "rose" | "violet";
}) {
  const glow =
    accent === "sky"
      ? "from-sky-500/14"
      : accent === "amber"
        ? "from-amber-400/16"
        : accent === "rose"
          ? "from-rose-500/14"
          : accent === "violet"
            ? "from-violet-500/14"
            : "from-emerald-500/14";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card/60 shadow-card backdrop-blur-xl transition-all duration-300 hover:shadow-card-hover",
        "dark:border-white/6 dark:bg-slate-950/35",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-10 -top-24 h-48 bg-gradient-to-b via-transparent to-transparent blur-3xl opacity-80",
          glow,
        )}
      />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 card-sheen" />
      <div className="relative p-5 sm:p-6">{children}</div>
    </div>
  );
}

