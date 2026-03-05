import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import MetricCard from "@/components/MetricCard";
import { useEnergyData } from "@/hooks/useEnergyData";
import { useMemo } from "react";
import { motion } from "framer-motion";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const { realtime, history, getDailyEnergy, getMonthlyEnergy } = useEnergyData();

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Real-time energy monitoring from ESP8266 + PZEM-004T</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="Voltage" value={realtime.voltage} unit="V" type="voltage" />
        <MetricCard title="Current" value={realtime.current} unit="A" type="current" />
        <MetricCard title="Power" value={realtime.power} unit="W" type="power" />
        <MetricCard title="Energy" value={realtime.energy} unit="kWh" type="energy" />
        <MetricCard title="Frequency" value={realtime.frequency} unit="Hz" type="frequency" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Power vs Time (Real-time)</h3>
          <div className="h-64">
            <Line data={powerChartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Daily Energy Consumption</h3>
          <div className="h-64">
            <Bar data={dailyData} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl p-5 shadow-card border border-border">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">Monthly Energy Consumption</h3>
        <div className="h-64">
          <Line data={monthlyData} options={chartOptions} />
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
