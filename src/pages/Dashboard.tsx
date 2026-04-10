import { Line, Bar } from "react-chartjs-2";
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

import MetricCard from "@/components/MetricCard";
import { useEnergyData } from "@/hooks/useEnergyData";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { realtime, realtimeLoading, history, historyLoading, getDailyEnergy, getMonthlyEnergy } = useEnergyData();

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const hasTimestamp = !!realtime?.timestamp;
  const lastTs = hasTimestamp ? realtime.timestamp.getTime() : 0;
  const ageMs = hasTimestamp ? Math.max(0, now - lastTs) : Number.POSITIVE_INFINITY;
  const ageSeconds = hasTimestamp ? Math.floor(ageMs / 1000) : null;

  const isLive = hasTimestamp && ageMs <= 10000;
  const metricStatus: "live" | "disconnected" | "loading" =
    realtimeLoading && !hasTimestamp ? "loading" : isLive ? "live" : "disconnected";

  const prevReading = useMemo(() => {
    const valid = history.filter((r) => r.timestamp != null);
    if (valid.length < 2) return null;
    return valid[valid.length - 2];
  }, [history]);

  const powerChartData = useMemo(() => {
    const valid = history.filter((r) => r.timestamp && r.power != null);
    const last30 = valid.slice(-30);

    return {
      labels: last30.map((r) =>
        r.timestamp.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      ),
      datasets: [
        {
          label: "Power (W)",
          data: last30.map((r) => r.power),
          borderColor: "hsl(160 84% 39%)",
          backgroundColor: "rgba(16,185,129,0.15)",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    };
  }, [history]);

  const dailyData = useMemo(() => {
    const d = getDailyEnergy();

    return {
      labels: d.map((x) => x.day),
      datasets: [
        {
          label: "Energy (kWh)",
          data: d.map((x) => x.energy),
          backgroundColor: "rgba(59,130,246,0.7)",
          borderRadius: 10,
        },
      ],
    };
  }, [getDailyEnergy]);

  const monthlyData = useMemo(() => {
    const m = getMonthlyEnergy();

    return {
      labels: m.map((x) => x.month),
      datasets: [
        {
          label: "Energy (kWh)",
          data: m.map((x) => x.energy),
          borderColor: "hsl(30 95% 55%)",
          backgroundColor: "rgba(251,146,60,0.15)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        },
      ],
    };
  }, [getMonthlyEnergy]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "rgba(71,85,105,0.9)",
          font: { size: 11 },
        },
      },
      y: {
        grid: {
          color: "rgba(100,116,139,0.2)",
          drawBorder: false,
        },
        ticks: {
          color: "rgba(71,85,105,0.9)",
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="space-y-4">

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-800 dark:text-slate-200 leading-[1.05] break-words"
        >
          Smart Energy
          <span className="block mt-2 bg-gradient-to-r from-emerald-400 via-sky-400 to-cyan-300 bg-clip-text text-transparent">
            Dashboard
          </span>
        </motion.h1>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <MetricCard title="Voltage" value={realtime.voltage} previousValue={prevReading?.voltage ?? null} unit="V" type="voltage" status={metricStatus} lastSeenSeconds={isLive ? null : ageSeconds}/>
        <MetricCard title="Current" value={realtime.current} previousValue={prevReading?.current ?? null} unit="A" type="current" status={metricStatus} lastSeenSeconds={isLive ? null : ageSeconds}/>
        <MetricCard title="Power" value={realtime.power} previousValue={prevReading?.power ?? null} unit="W" type="power" status={metricStatus} lastSeenSeconds={isLive ? null : ageSeconds}/>
        <MetricCard title="Energy" value={realtime.energy} previousValue={prevReading?.energy ?? null} unit="kWh" type="energy" status={metricStatus} lastSeenSeconds={isLive ? null : ageSeconds}/>
        <MetricCard title="Frequency" value={realtime.frequency} previousValue={prevReading?.frequency ?? null} unit="Hz" type="frequency" status={metricStatus} lastSeenSeconds={isLive ? null : ageSeconds}/>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* Power Chart */}
        <div className="rounded-3xl border border-gray-200 dark:border-white/10 p-5 sm:p-6 lg:p-8 min-w-0">

          <div className="flex items-center gap-3 mb-6">

            <div className="h-3 w-3 rounded-full bg-emerald-400"/>

            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">
              Power vs Time (Real-time)
            </h3>

            <div className="ml-auto px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                LIVE
              </span>
            </div>

          </div>

          <div className="h-64 sm:h-72 min-w-0">
            {historyLoading ? (
              <div className="h-full w-full rounded-2xl bg-muted/40 animate-pulse" />
            ) : (
              <Line data={powerChartData} options={chartOptions} />
            )}
          </div>

        </div>

        {/* Daily Chart */}
        <div className="rounded-3xl border border-gray-200 dark:border-white/10 p-5 sm:p-6 lg:p-8 min-w-0">

          <div className="flex items-center gap-3 mb-6">
            <div className="h-3 w-3 rounded-full bg-sky-400"/>

            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">
              Daily Energy Consumption
            </h3>
          </div>

          <div className="h-64 sm:h-72 min-w-0">
            <Bar data={dailyData} options={chartOptions} />
          </div>

        </div>

      </div>

      {/* Monthly Chart */}
      <div className="rounded-3xl border border-gray-200 dark:border-white/10 p-5 sm:p-6 lg:p-8 min-w-0">

        <div className="flex items-center gap-3 mb-6">

          <div className="h-3 w-3 rounded-full bg-amber-400"/>

          <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">
            Monthly Energy Consumptions
          </h3>

          <div className="ml-auto px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-300">
              TRENDING
            </span>
          </div>

        </div>

        <div className="h-64 sm:h-72 min-w-0">
          <Line data={monthlyData} options={chartOptions} />
        </div>

      </div>

    </div>
  );
};

export default Dashboard;