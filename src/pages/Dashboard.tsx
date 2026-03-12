import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import MetricCard from "@/components/MetricCard";
import { useEnergyData } from "@/hooks/useEnergyData";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

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
  const isLive = realtime.live ?? isLiveByTime;

  const powerChartData = useMemo(() => {
    const last30 = history.slice(-30);
    return {
      labels: last30.map((r) => r.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })),
      datasets: [{
        label: "Power (W)",
        data: last30.map((r) => r.power),
        borderColor: "hsl(160, 84%, 39%)",
        backgroundColor: "hsla(160, 84%, 39%, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
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
        backgroundColor: "hsl(200, 80%, 50%)",
        borderRadius: 8,
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
        borderColor: "hsl(30, 95%, 55%)",
        backgroundColor: "hsla(30, 95%, 55%, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 2,
      }],
    };
  }, [getMonthlyEnergy]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: "hsla(220, 10%, 50%, 0.1)" }, ticks: { font: { size: 10 } } },
    },
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-[11px] font-medium mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
            LIVE IOT ENERGY STREAM
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50">
            Smart Energy <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-cyan-300 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Real-time monitoring from ESP8266 + PZEM-004T with intelligent trends and insights.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Voltage"
          value={realtime.voltage}
          unit="V"
          type="voltage"
          status={isLive ? "live" : "disconnected"}
          lastSeenSeconds={isLive ? null : ageSeconds}
        />
        <MetricCard
          title="Current"
          value={realtime.current}
          unit="A"
          type="current"
          status={isLive ? "live" : "disconnected"}
          lastSeenSeconds={isLive ? null : ageSeconds}
        />
        <MetricCard
          title="Power"
          value={realtime.power}
          unit="W"
          type="power"
          status={isLive ? "live" : "disconnected"}
          lastSeenSeconds={isLive ? null : ageSeconds}
        />
        <MetricCard
          title="Energy"
          value={realtime.energy}
          unit="kWh"
          type="energy"
          status={isLive ? "live" : "disconnected"}
          lastSeenSeconds={isLive ? null : ageSeconds}
        />
        <MetricCard
          title="Frequency"
          value={realtime.frequency}
          unit="Hz"
          type="frequency"
          status={isLive ? "live" : "disconnected"}
          lastSeenSeconds={isLive ? null : ageSeconds}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-2xl border border-white/5 bg-slate-950/60 shadow-[0_18px_45px_rgba(15,23,42,0.85)] overflow-hidden"
        >
          <div className="pointer-events-none absolute inset-x-12 -top-24 h-44 bg-gradient-to-b from-emerald-500/15 via-transparent to-transparent blur-3xl" />
          <div className="relative p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Power vs Time (Real-time)
            </h3>
            <div className="h-64">
              <Line data={powerChartData} options={chartOptions} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="relative rounded-2xl border border-white/5 bg-slate-950/60 shadow-[0_18px_45px_rgba(15,23,42,0.85)] overflow-hidden"
        >
          <div className="pointer-events-none absolute inset-x-10 -top-24 h-44 bg-gradient-to-b from-sky-500/18 via-transparent to-transparent blur-3xl" />
          <div className="relative p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-slate-100 mb-4">
              Daily Energy Consumption
            </h3>
            <div className="h-64">
              <Bar data={dailyData} options={chartOptions} />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="relative rounded-2xl border border-white/5 bg-slate-950/60 shadow-[0_18px_45px_rgba(15,23,42,0.9)] overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-x-24 -top-24 h-44 bg-gradient-to-b from-amber-400/16 via-transparent to-transparent blur-3xl" />
        <div className="relative p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-slate-100 mb-4">
            Monthly Energy Consumption
          </h3>
          <div className="h-64">
            <Line data={monthlyData} options={chartOptions} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
