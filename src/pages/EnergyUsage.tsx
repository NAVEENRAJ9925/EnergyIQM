import { useState, useMemo } from "react";
import { Bar, Line } from "react-chartjs-2";
import { useEnergyData } from "@/hooks/useEnergyData";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { motion } from "framer-motion";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

type Filter = "day" | "week" | "month";

const EnergyUsage = () => {
  const [filter, setFilter] = useState<Filter>("day");
  const { getDailyEnergy, getWeeklyEnergy, getMonthlyEnergy } = useEnergyData();

  const chartData = useMemo(() => {
    if (filter === "day") {
      const d = getDailyEnergy();
      return { labels: d.map((x) => x.day), data: d.map((x) => x.energy) };
    }
    if (filter === "week") {
      const w = getWeeklyEnergy();
      return { labels: w.map((x) => x.week), data: w.map((x) => x.energy) };
    }
    const m = getMonthlyEnergy();
    return { labels: m.map((x) => x.month), data: m.map((x) => x.energy) };
  }, [filter, getDailyEnergy, getWeeklyEnergy, getMonthlyEnergy]);

  const config = {
    labels: chartData.labels,
    datasets: [{
      label: `Energy (kWh) - ${filter}`,
      data: chartData.data,
      backgroundColor: filter === "day" ? "hsl(160, 84%, 39%)" : filter === "week" ? "hsl(200, 80%, 50%)" : "hsl(270, 70%, 55%)",
      borderColor: filter === "month" ? "hsl(270, 70%, 55%)" : undefined,
      borderRadius: filter !== "month" ? 8 : undefined,
      fill: filter === "month",
      tension: 0.4,
      pointRadius: filter === "month" ? 3 : undefined,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "hsla(220,10%,50%,0.1)" } },
    },
  };

  const filters: Filter[] = ["day", "week", "month"];

  const total = chartData.data.reduce((a, b) => a + b, 0);
  const avg = chartData.data.length ? total / chartData.data.length : 0;
  const peak = chartData.data.length ? Math.max(...chartData.data) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-300 text-[11px] font-medium mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse-glow" />
            USAGE TRENDS
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Energy{" "}
            <span className="bg-gradient-to-r from-sky-500 via-emerald-500 to-cyan-400 bg-clip-text text-transparent">
              Usage Analytics
            </span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Switch between daily, weekly, and monthly views to spot patterns and peaks.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all border ${
              filter === f
                ? "border-transparent bg-gradient-to-r from-sky-400 via-emerald-400 to-cyan-300 text-slate-950 shadow-[0_10px_30px_rgba(56,189,248,0.5)]"
                : "border-slate-700/80 bg-slate-900/70 text-slate-300 hover:border-sky-400/60 hover:text-sky-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative rounded-2xl border border-border bg-card shadow-card overflow-hidden dark:border-white/5 dark:bg-slate-950/60 dark:shadow-[0_18px_45px_rgba(15,23,42,0.85)]"
      >
        <div className="pointer-events-none absolute inset-x-16 -top-24 h-44 bg-gradient-to-b from-sky-500/16 via-transparent to-transparent blur-3xl" />
        <div className="relative p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-slate-100 mb-4">
            {filter === "day" ? "Daily" : filter === "week" ? "Weekly" : "Monthly"} Energy Consumption
          </h3>
          <div className="h-80">
            {filter === "month" ? (
              <Line data={config} options={options} />
            ) : (
              <Bar data={config} options={options} />
            )}
          </div>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.02 }}
          className="relative rounded-2xl border border-border bg-card p-5 shadow-card overflow-hidden dark:border-white/5 dark:bg-slate-950/70 dark:shadow-[0_14px_36px_rgba(15,23,42,0.9)]"
        >
          <div className="pointer-events-none absolute inset-x-6 -top-10 h-24 bg-gradient-to-b from-emerald-400/20 via-transparent to-transparent blur-2xl" />
          <div className="relative">
            <p className="text-sm text-slate-400">Total Consumption</p>
            <p className="text-2xl font-bold text-slate-50 font-mono mt-1">
              {total.toFixed(1)}{" "}
              <span className="text-sm font-normal text-slate-400">kWh</span>
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="relative rounded-2xl border border-border bg-card p-5 shadow-card overflow-hidden dark:border-white/5 dark:bg-slate-950/70 dark:shadow-[0_14px_36px_rgba(15,23,42,0.9)]"
        >
          <div className="pointer-events-none absolute inset-x-6 -top-10 h-24 bg-gradient-to-b from-sky-400/20 via-transparent to-transparent blur-2xl" />
          <div className="relative">
            <p className="text-sm text-slate-400">Average</p>
            <p className="text-2xl font-bold text-slate-50 font-mono mt-1">
              {avg.toFixed(1)}{" "}
              <span className="text-sm font-normal text-slate-400">kWh</span>
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="relative rounded-2xl border border-border bg-card p-5 shadow-card overflow-hidden dark:border-white/5 dark:bg-slate-950/70 dark:shadow-[0_14px_36px_rgba(15,23,42,0.9)]"
        >
          <div className="pointer-events-none absolute inset-x-6 -top-10 h-24 bg-gradient-to-b from-amber-400/20 via-transparent to-transparent blur-2xl" />
          <div className="relative">
            <p className="text-sm text-slate-400">Peak Usage</p>
            <p className="text-2xl font-bold text-slate-50 font-mono mt-1">
              {peak.toFixed(1)}{" "}
              <span className="text-sm font-normal text-slate-400">kWh</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnergyUsage;
