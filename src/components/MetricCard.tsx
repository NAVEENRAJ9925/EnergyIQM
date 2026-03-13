import { useEffect, useMemo } from "react";
import { Zap, Activity, Gauge, Battery, Radio } from "lucide-react";
import { animate, motion, useMotionValue } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | number | null;
  previousValue?: number | null;
  unit: string;
  type: "voltage" | "current" | "power" | "energy" | "frequency";
  status?: "live" | "disconnected";
  lastSeenSeconds?: number | null;
}

const iconMap = {
  voltage: Zap,
  current: Activity,
  power: Gauge,
  energy: Battery,
  frequency: Radio,
};

const colorMap = {
  voltage: "text-energy-yellow",
  current: "text-energy-blue",
  power: "text-energy-green",
  energy: "text-energy-orange",
  frequency: "text-energy-purple",
};

const bgMap = {
  voltage: "bg-energy-yellow/10",
  current: "bg-energy-blue/10",
  power: "bg-energy-green/10",
  energy: "bg-energy-orange/10",
  frequency: "bg-energy-purple/10",
};

const MetricCard = ({ title, value, previousValue, unit, type, status = "live", lastSeenSeconds }: MetricCardProps) => {
  const Icon = iconMap[type];

  const isLive = status === "live";
  const numericValue = typeof value === "number" ? value : value != null ? Number(value) : null;
  const displayValue = isLive && numericValue != null && Number.isFinite(numericValue) ? numericValue : null;
  const statusLabel = isLive ? "Live" : lastSeenSeconds != null ? `Disconnected · Last seen ${lastSeenSeconds}s ago` : "Disconnected";

  // Animated value transitions
  const mv = useMotionValue(0);
  useEffect(() => {
    if (!isLive || displayValue == null) return;
    const controls = animate(mv, displayValue, { duration: 0.45, ease: "easeOut" });
    return () => controls.stop();
  }, [displayValue, isLive, mv]);

  const decimals =
    type === "current" ? 2 :
    type === "energy" ? 3 :
    type === "frequency" ? 1 :
    type === "voltage" ? 1 :
    0;

  const formatted = useMemo(() => {
    if (!isLive || displayValue == null) return "--";
    const v = mv.get();
    if (!Number.isFinite(v)) return "--";
    return v.toFixed(decimals);
  }, [decimals, displayValue, isLive, mv]);

  const trend = useMemo(() => {
    if (!isLive || displayValue == null || previousValue == null) return null;
    if (!Number.isFinite(previousValue) || previousValue === 0) return null;
    const pct = ((displayValue - previousValue) / Math.abs(previousValue)) * 100;
    if (!Number.isFinite(pct)) return null;
    const dir = pct > 0.15 ? "up" : pct < -0.15 ? "down" : "flat";
    return { pct: Math.abs(pct), dir };
  }, [displayValue, isLive, previousValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="group relative rounded-2xl border border-border/70 bg-card/85 dark:bg-slate-950/40 backdrop-blur-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 card-sheen" />
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/90">
          {title}
        </span>
        <div className={`relative p-2.5 rounded-xl ${bgMap[type]} border border-border/60`}>
          <div className={`pointer-events-none absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity ${bgMap[type]}`} />
          <Icon className={`relative h-4 w-4 ${colorMap[type]}`} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-card-foreground font-mono tabular-nums tracking-tight">
          {formatted}
        </span>
        <span className="text-xs font-medium text-muted-foreground/90">{unit}</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
        <div
          className={`h-1.5 w-1.5 rounded-full ${
            isLive ? colorMap[type].replace("text-", "bg-") : "bg-slate-500"
          } ${isLive ? "animate-pulse-glow" : ""}`}
        />
        <span className="text-xs text-muted-foreground">{statusLabel}</span>
        </div>
        {trend && (
          <span
            className={`text-[11px] font-semibold ${
              trend.dir === "up" ? "text-emerald-500" : trend.dir === "down" ? "text-rose-500" : "text-muted-foreground"
            }`}
          >
            {trend.dir === "up" ? "↑" : trend.dir === "down" ? "↓" : "•"} {trend.pct.toFixed(1)}%
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;
