import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import MetricCard from "@/components/MetricCard";
import { useEnergyData } from "@/hooks/useEnergyData";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const { realtime, history, getDailyEnergy, getMonthlyEnergy } = useEnergyData();

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const hasTimestamp = !!realtime?.timestamp;
  const lastTs = hasTimestamp ? realtime!.timestamp!.getTime() : 0;
  const ageMs = hasTimestamp ? Math.max(0, now - lastTs) : Number.POSITIVE_INFINITY;
  const ageSeconds = hasTimestamp ? Math.floor(ageMs / 1000) : null;
  const isLiveByTime = hasTimestamp && ageMs <= 10_000;
  // Device LIVE is determined strictly by "freshness" of the last timestamp.
  const isLive = isLiveByTime;

  const prevReading = useMemo(() => {
    const valid = history.filter((r) => r.timestamp != null);
    if (valid.length < 2) return null;
    return valid[valid.length - 2];
  }, [history]);

  const powerChartData = useMemo(() => {
    const valid = history.filter((r) => r.timestamp != null && r.power != null);
    const last30 = valid.slice(-30);
    return {
      labels: last30.map((r) => r.timestamp!.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })),
      datasets: [{
        label: "Power (W)",
        data: last30.map((r) => r.power),
        borderColor: "hsl(160 84% 39%)",
        backgroundColor: (ctx: { chart: any }) => {
          const { chart } = ctx;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return "hsla(160, 84%, 39%, 0.08)";
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, "hsla(160, 84%, 39%, 0.28)");
          g.addColorStop(0.55, "hsla(160, 84%, 39%, 0.10)");
          g.addColorStop(1, "hsla(160, 84%, 39%, 0.00)");
          return g;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 3,
        borderWidth: 2,
      }],
    };
  }, [history]);

  const dailyData = useMemo(() => {
    const d = getDailyEnergy();
    return {
      labels: d.map((x) => x.day),
      datasets: [{
        label: "Energy (kWh)",
        data: d.map((x) => x.energy),
        backgroundColor: (ctx: { chart: any }) => {
          const { chart } = ctx;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return "hsla(200, 80%, 50%, 0.8)";
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, "hsla(200, 80%, 55%, 0.95)");
          g.addColorStop(1, "hsla(200, 80%, 45%, 0.55)");
          return g;
        },
        hoverBackgroundColor: "hsla(200, 80%, 55%, 0.98)",
        borderRadius: 10,
        borderSkipped: false,
      }],
    };
  }, [getDailyEnergy]);

  const monthlyData = useMemo(() => {
    const m = getMonthlyEnergy();
    return {
      labels: m.map((x) => x.month),
      datasets: [{
        label: "Energy (kWh)",
        data: m.map((x) => x.energy),
        borderColor: "hsl(30 95% 55%)",
        backgroundColor: (ctx: { chart: any }) => {
          const { chart } = ctx;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return "hsla(30, 95%, 55%, 0.08)";
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, "hsla(30, 95%, 55%, 0.22)");
          g.addColorStop(0.6, "hsla(30, 95%, 55%, 0.10)");
          g.addColorStop(1, "hsla(30, 95%, 55%, 0.00)");
          return g;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 2,
      }],
    };
  }, [getMonthlyEnergy]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 850, easing: "easeOutQuart" as const },
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "rgba(226, 232, 240, 0.98)",
        bodyColor: "rgba(226, 232, 240, 0.92)",
        borderColor: "rgba(148, 163, 184, 0.25)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 16,
        displayColors: false,
        titleFont: { size: 12, weight: "700" as const },
        bodyFont: { size: 13, weight: "600" as const },
        callbacks: {
          label: (item: any) => {
            const v = item?.parsed?.y;
            if (typeof v !== "number") return "";
            const suffix = item?.dataset?.label?.includes("Power") ? " W" : " kWh";
            return `${v.toFixed(2)}${suffix}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: "500" }, color: "rgba(148,163,184,0.8)" },
      },
      y: {
        grid: { color: "rgba(148,163,184,0.12)", drawBorder: false },
        ticks: { font: { size: 11, weight: "500" }, color: "rgba(148,163,184,0.8)" },
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-4">
          
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-50"
          >
            Smart Energy 
            <span className="block mt-2 bg-gradient-to-r from-emerald-400 via-sky-400 to-cyan-300 bg-clip-text text-transparent">
              Dashboard
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base text-slate-400 max-w-2xl"
          >
            Real-time monitoring from ESP8266 + PZEM-004T with intelligent trends and insights.
          </motion.p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
        <MetricCard
          title="Voltage"
          value={realtime.voltage}
          previousValue={prevReading?.voltage ?? null}
          unit="V"
          type="voltage"
          status={isLive ? "live" : "disconnected"}
          lastSeenSeconds={isLive ? null : ageSeconds}
        />
        <MetricCard
          title="Current"
          value={realtime.current}
          previousValue={prevReading?.current ?? null}
          unit="A"
          type="current"
          status={isLive ? "live" : "disconnected"}
          lastSeenSeconds={isLive ? null : ageSeconds}
        />
        <MetricCard
          title="Power"
          value={realtime.power}
          previousValue={prevReading?.power ?? null}
          unit="W"
          type="power"
          status={isLive ? "live" : "disconnected"}
          lastSeenSeconds={isLive ? null : ageSeconds}
        />
        <MetricCard
          title="Energy"
          value={realtime.energy}
          previousValue={prevReading?.energy ?? null}
          unit="kWh"
          type="energy"
          status={isLive ? "live" : "disconnected"}
          lastSeenSeconds={isLive ? null : ageSeconds}
        />
        <MetricCard
          title="Frequency"
          value={realtime.frequency}
          previousValue={prevReading?.frequency ?? null}
          unit="Hz"
          type="frequency"
          status={isLive ? "live" : "disconnected"}
          lastSeenSeconds={isLive ? null : ageSeconds}
        />
      </div>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="group relative rounded-3xl border border-white/8 glass-dark overflow-hidden hover-lift"
        >
          {/* Gradient glow effect */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="pointer-events-none absolute inset-x-12 -top-32 h-48 bg-gradient-to-b from-emerald-500/20 via-transparent to-transparent blur-3xl" />
          
          <div className="relative p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse-glow shadow-neon" />
              <h3 className="text-lg font-bold text-slate-100">Power vs Time (Real-time)</h3>
              <div className="ml-auto px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs font-semibold text-emerald-300">LIVE</span>
              </div>
            </div>
            <div className="h-72">
              {powerChartData.labels.length === 0 ? (
                <div className="h-full rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
              ) : (
                <Line data={powerChartData} options={chartOptions} />
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="group relative rounded-3xl border border-white/8 glass-dark overflow-hidden hover-lift"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="pointer-events-none absolute inset-x-10 -top-32 h-48 bg-gradient-to-b from-sky-500/20 via-transparent to-transparent blur-3xl" />
          
          <div className="relative p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-sky-400 to-purple-400 animate-pulse-slow" />
              <h3 className="text-lg font-bold text-slate-100">Daily Energy Consumption</h3>
            </div>
            <div className="h-72">
              {dailyData.labels.length === 0 ? (
                <div className="h-full rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
              ) : (
                <Bar data={dailyData} options={chartOptions} />
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="group relative rounded-3xl border border-white/8 glass-dark overflow-hidden hover-lift"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="pointer-events-none absolute inset-x-24 -top-32 h-48 bg-gradient-to-b from-amber-400/20 via-transparent to-transparent blur-3xl" />
        
        <div className="relative p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 animate-pulse-slower" />
            <h3 className="text-lg font-bold text-slate-100">Monthly Energy Consumption</h3>
            <div className="ml-auto px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="text-xs font-semibold text-amber-300">TRENDING</span>
            </div>
          </div>
          <div className="h-72">
            {monthlyData.labels.length === 0 ? (
              <div className="h-full rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            ) : (
              <Line data={monthlyData} options={chartOptions} />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
