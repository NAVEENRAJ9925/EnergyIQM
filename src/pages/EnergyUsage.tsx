import { useState, useMemo } from "react";
import { Bar, Line } from "react-chartjs-2";
import { useEnergyData } from "@/hooks/useEnergyData";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
} from "chart.js";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Energy Usage</h1>
        <p className="text-sm text-muted-foreground">Analyze your energy consumption patterns</p>
      </div>

      <div className="flex gap-2">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">
          {filter === "day" ? "Daily" : filter === "week" ? "Weekly" : "Monthly"} Energy Consumption
        </h3>
        <div className="h-80">
          {filter === "month" ? <Line data={config} options={options} /> : <Bar data={config} options={options} />}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 shadow-card border border-border">
          <p className="text-sm text-muted-foreground">Total Consumption</p>
          <p className="text-2xl font-bold text-card-foreground font-mono mt-1">
            {chartData.data.reduce((a, b) => a + b, 0).toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kWh</span>
          </p>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-card border border-border">
          <p className="text-sm text-muted-foreground">Average</p>
          <p className="text-2xl font-bold text-card-foreground font-mono mt-1">
            {(chartData.data.reduce((a, b) => a + b, 0) / chartData.data.length).toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kWh</span>
          </p>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-card border border-border">
          <p className="text-sm text-muted-foreground">Peak Usage</p>
          <p className="text-2xl font-bold text-card-foreground font-mono mt-1">
            {Math.max(...chartData.data).toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kWh</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnergyUsage;
