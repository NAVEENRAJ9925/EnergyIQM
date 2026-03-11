import { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  Clock,
  Lightbulb,
  Leaf,
  BarChart3,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

interface InsightCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
  color: string;
  bg: string;
}

const InsightCard = ({ icon: Icon, title, value, description, color, bg }: InsightCardProps) => (
  <div className="relative rounded-2xl p-5 border border-border bg-card shadow-card overflow-hidden hover:shadow-card-hover transition-shadow dark:border-white/5 dark:bg-slate-950/70 dark:shadow-[0_16px_40px_rgba(15,23,42,0.9)] dark:hover:shadow-[0_20px_55px_rgba(15,23,42,1)]">
    <div className="pointer-events-none absolute inset-x-6 -top-10 h-24 bg-gradient-to-b from-white/10 via-transparent to-transparent blur-2xl" />
    <div className="relative">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${bg}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <span className="text-sm font-medium text-card-foreground">{title}</span>
      </div>
      <p className="text-xl font-bold font-mono text-card-foreground mb-2">{value}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

const AIInsights = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consumption, setConsumption] = useState<{
    predicted_units: number;
    confidence: number;
  } | null>(null);
  const [bill, setBill] = useState<{ predicted_units: number; estimated_bill: number } | null>(null);
  const [peakHours, setPeakHours] = useState<{
    peak_hours: string[];
    avg_peak_power: number;
  } | null>(null);
  const [anomalies, setAnomalies] = useState<
    { timestamp: string; power: number; expected: number; severity: string }[]
  >([]);
  const [recommendations, setRecommendations] = useState<
    { tip: string; potential_saving: string }[]
  >([]);
  const [carbon, setCarbon] = useState<{
    total_kwh: number;
    co2_kg: number;
    vs_regional_avg: string;
    pct_diff_from_avg: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const run = async () => {
      const ML = import.meta.env.VITE_ML_URL || "http://localhost:5001";
      const fetchDirect = async (path: string) => {
  try {
    const r = await fetch(`${ML}${path}`);
    const d = await r.json().catch(() => ({}));
    return r.ok ? d : null;
  } catch {
    return null;
  }
};
      const results = await Promise.allSettled([
        fetchDirect<{ predicted_units: number; confidence: number }>("/api/ml/predict-consumption"),
        fetchDirect<{ predicted_units: number; estimated_bill: number }>("/api/ml/predict-bill"),
        fetchDirect<{ peak_hours: string[]; avg_peak_power: number }>("/api/ml/peak-hours"),
        fetchDirect<{ anomalies: { timestamp: string; power: number; expected: number; severity: string }[] }>("/api/ml/anomalies"),
        fetchDirect<{ recommendations: { tip: string; potential_saving: string }[] }>("/api/ml/recommendations"),
        fetchDirect<{ total_kwh: number; co2_kg: number; vs_regional_avg: string; pct_diff_from_avg: number }>("/api/ml/carbon-footprint"),
      ]);
      if (cancelled) return;
      const [cons, b, peak, anom, rec, carb] = results.map((r) => (r.status === "fulfilled" ? r.value : null));
      if (cons) setConsumption(cons);
      if (b) setBill(b);
      if (peak) setPeakHours(peak);
      if (anom) setAnomalies(anom.anomalies || []);
      if (rec) setRecommendations(rec.recommendations || []);
      if (carb) setCarbon(carb);
      if (!cons && !b && !peak && !anom && !rec && !carb) {
        setError("Could not load any insights. Ensure ML service is running (npm run ml).");
      }
      setLoading(false);
    };
    run();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
          <p className="text-sm text-muted-foreground">Machine learning-powered energy analysis</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
          <p className="text-sm text-muted-foreground">Machine learning-powered energy analysis</p>
        </div>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {error}. Ensure both backend (npm run api) and ML service (npm run ml) are running.
        </div>
      </div>
    );
  }

  const insightsData: (InsightCardProps & { key: string })[] = [
    {
      key: "consumption",
      icon: TrendingUp,
      title: "Predicted Monthly Consumption",
      value: `${consumption?.predicted_units ?? 0} units`,
      description: `Based on your usage over the last 90 days. Model confidence: ${Math.round((consumption?.confidence ?? 0) * 100)}%.`,
      color: "text-energy-blue",
      bg: "bg-energy-blue/10",
    },
    {
      key: "bill",
      icon: BarChart3,
      title: "Estimated Electricity Bill",
      value: `₹${(bill?.estimated_bill ?? 0).toFixed(2)}`,
      description: `TNEB bill estimate for this month based on predicted consumption of ${bill?.predicted_units ?? 0} units.`,
      color: "text-energy-green",
      bg: "bg-energy-green/10",
    },
    {
      key: "peak",
      icon: Clock,
      title: "Peak Usage Hours",
      value: peakHours?.peak_hours?.join(", ") || "—",
      description: `Peak electricity usage hours. Avg peak power: ${peakHours?.avg_peak_power ?? 0} W. Shift non-essential loads outside these hours.`,
      color: "text-energy-orange",
      bg: "bg-energy-orange/10",
    },
    {
      key: "recommendation",
      icon: Lightbulb,
      title: "Energy Saving Tip",
      value: recommendations[0]?.potential_saving || "Up to 15%",
      description: recommendations[0]?.tip || "Switch to LED lighting and use appliances during off-peak hours.",
      color: "text-energy-yellow",
      bg: "bg-energy-yellow/10",
    },
    {
      key: "carbon",
      icon: Leaf,
      title: "Carbon Footprint",
      value: `${carbon?.co2_kg ?? 0} kg CO₂`,
      description: `Monthly footprint from ${carbon?.total_kwh ?? 0} kWh. You are ${carbon?.vs_regional_avg ?? "—"} regional average (${carbon?.pct_diff_from_avg ?? 0}%).`,
      color: "text-energy-green",
      bg: "bg-energy-green/10",
    },
    {
      key: "anomalies",
      icon: Brain,
      title: "Anomaly Detection",
      value: `${anomalies.length} detected`,
      description:
        anomalies.length > 0
          ? `Unusual consumption spikes detected. Review alerts for details.`
          : "No unusual spikes detected in your consumption pattern.",
      color: "text-energy-red",
      bg: "bg-energy-red/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 text-violet-700 dark:text-violet-200 text-[11px] font-medium mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse-glow" />
          ML INSIGHTS
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          AI-powered{" "}
          <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400 bg-clip-text text-transparent">
            Energy Intelligence
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Forecast consumption, predict bills, detect anomalies, and measure carbon footprint using the ML microservice.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {insightsData.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <InsightCard
              icon={item.icon}
              title={item.title}
              value={item.value}
              description={item.description}
              color={item.color}
              bg={item.bg}
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl p-6 border border-border bg-card shadow-card overflow-hidden dark:border-white/5 dark:bg-slate-950/70 dark:shadow-[0_18px_50px_rgba(15,23,42,1)]"
      >
        <div className="pointer-events-none absolute inset-x-10 -top-16 h-40 bg-gradient-to-b from-yellow-400/20 via-transparent to-transparent blur-3xl" />
        <h3 className="relative text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-energy-yellow" /> Energy Saving Recommendations
        </h3>
        <div className="relative space-y-3">
          {recommendations.length > 0 ? (
            recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <span className="text-xs font-bold text-primary mt-0.5">{i + 1}.</span>
                <div>
                  <p className="text-sm text-card-foreground">{rec.tip}</p>
                  <span className="text-xs text-energy-green font-medium">Save {rec.potential_saving}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Start monitoring your energy to get personalized recommendations.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AIInsights;
