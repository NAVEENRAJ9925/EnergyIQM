import { Zap, Activity, Gauge, Battery, Radio } from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | number | null;
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

const MetricCard = ({ title, value, unit, type, status = "live", lastSeenSeconds }: MetricCardProps) => {
  const Icon = iconMap[type];

  const isLive = status === "live";
  const displayValue = isLive && value != null && value !== "" ? value : "--";
  const statusLabel = isLive ? "Live" : lastSeenSeconds != null ? `Disconnected · Last seen ${lastSeenSeconds}s ago` : "Disconnected";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card p-5 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className={`p-2 rounded-lg ${bgMap[type]}`}>
          <Icon className={`h-4 w-4 ${colorMap[type]}`} />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-card-foreground font-mono">{displayValue}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-2 flex items-center gap-1">
        <div
          className={`h-1.5 w-1.5 rounded-full ${
            isLive ? colorMap[type].replace("text-", "bg-") : "bg-slate-500"
          } ${isLive ? "animate-pulse-glow" : ""}`}
        />
        <span className="text-xs text-muted-foreground">{statusLabel}</span>
      </div>
    </motion.div>
  );
};

export default MetricCard;
