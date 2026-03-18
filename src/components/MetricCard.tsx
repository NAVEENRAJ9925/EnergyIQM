import { useEffect, useMemo, useState } from "react";
import { Zap, Activity, Gauge, Battery, Radio, TrendingUp, TrendingDown } from "lucide-react";
import { animate, motion, useMotionValue, useMotionValueEvent } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | number | null;
  previousValue?: number | null;
  unit: string;
  type: "voltage" | "current" | "power" | "energy" | "frequency";
  status?: "live" | "disconnected" | "loading";
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
  const isLoading = status === "loading";
  const numericValue = typeof value === "number" ? value : value != null ? Number(value) : null;
  const displayValue = isLive && numericValue != null && Number.isFinite(numericValue) ? numericValue : null;
  const statusLabel = isLive
    ? "Live"
    : isLoading
      ? "Loading…"
      : lastSeenSeconds != null
        ? `Disconnected · Last seen ${lastSeenSeconds}s ago`
        : "Disconnected";

  // Animated value transitions
  const mv = useMotionValue(displayValue ?? 0);
  const [animatedValue, setAnimatedValue] = useState(displayValue ?? 0);
  
  useMotionValueEvent(mv, "change", (latest) => {
    setAnimatedValue(latest);
  });

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
    if (isLoading) return "—";
    if (!isLive || displayValue == null) return "--";
    if (!Number.isFinite(animatedValue)) return "--";
    return animatedValue.toFixed(decimals);
  }, [decimals, displayValue, isLive, isLoading, animatedValue]);

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative h-full"
    >
      <div className="relative h-full p-6 rounded-3xl glass-dark border border-border/50 overflow-hidden hover-lift">
        {/* Animated gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${
          type === 'voltage' ? 'from-energy-yellow/10 to-energy-orange/5' :
          type === 'current' ? 'from-energy-blue/10 to-energy-cyan/5' :
          type === 'power' ? 'from-energy-green/10 to-emerald-500/5' :
          type === 'energy' ? 'from-energy-orange/10 to-energy-yellow/5' :
          'from-energy-purple/10 to-energy-pink/5'
        } opacity-0 group-hover:opacity-100 transition-all duration-700`} />
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1200" />
        
        {/* Glow effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${
          type === 'voltage' ? 'from-energy-yellow to-energy-orange' :
          type === 'current' ? 'from-energy-blue to-energy-cyan' :
          type === 'power' ? 'from-energy-green to-emerald-500' :
          type === 'energy' ? 'from-energy-orange to-energy-yellow' :
          'from-energy-purple to-energy-pink'
        } opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-3xl`} />
        
        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
              {title}
            </span>
            <div className={`relative p-3 rounded-2xl ${bgMap[type]} border border-border/40`}>
              <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity ${bgMap[type]}`} />
              <Icon className={`relative h-5 w-5 ${colorMap[type]}`} />
            </div>
          </div>
          
          {/* Value Display */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-black text-card-foreground font-mono tabular-nums tracking-tight">
              {formatted}
            </span>
            <span className="text-sm font-bold text-muted-foreground/90">{unit}</span>
          </div>
          
          {/* Status and Trend */}
          <div className="mt-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isLive ? colorMap[type].replace("text-", "bg-") : isLoading ? "bg-slate-400" : "bg-slate-500"
                } ${isLive ? "animate-pulse-glow shadow-neon" : ""}`}
              />
              <span className="text-xs font-semibold text-muted-foreground">{statusLabel}</span>
            </div>
            {trend && (
              <div className="flex items-center gap-1">
                {trend.dir === "up" ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                ) : trend.dir === "down" ? (
                  <TrendingDown className="h-3 w-3 text-rose-500" />
                ) : null}
                <span
                  className={`text-[11px] font-black ${
                    trend.dir === "up" ? "text-emerald-500" : trend.dir === "down" ? "text-rose-500" : "text-muted-foreground"
                  }`}
                >
                  {trend.pct.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;
