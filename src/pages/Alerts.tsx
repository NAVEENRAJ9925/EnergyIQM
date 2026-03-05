import { AlertTriangle, Zap, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const alerts = [
  {
    id: 1,
    type: "critical" as const,
    title: "High Power Consumption Detected",
    description: "Power consumption exceeded 1500W for more than 30 minutes. Check running appliances.",
    time: "2 hours ago",
    icon: Zap,
  },
  {
    id: 2,
    type: "warning" as const,
    title: "Abnormal Spike in Energy Usage",
    description: "An unusual spike of 2.3kW was detected at 3:45 PM. This is 180% above normal usage.",
    time: "5 hours ago",
    icon: TrendingUp,
  },
  {
    id: 3,
    type: "warning" as const,
    title: "Device Left ON for Too Long",
    description: "Motor has been running continuously for 8 hours. Consider scheduling auto-off.",
    time: "8 hours ago",
    icon: Clock,
  },
  {
    id: 4,
    type: "info" as const,
    title: "Monthly Consumption Threshold",
    description: "You've consumed 320 of your 400 unit target. At current rate, you'll exceed by 15%.",
    time: "1 day ago",
    icon: AlertTriangle,
  },
  {
    id: 5,
    type: "critical" as const,
    title: "Voltage Fluctuation Detected",
    description: "Voltage dropped to 198V at 2:30 AM. This may damage sensitive equipment.",
    time: "1 day ago",
    icon: Zap,
  },
];

const typeStyles = {
  critical: { border: "border-destructive/30", bg: "bg-destructive/5", badge: "bg-destructive/10 text-destructive" },
  warning: { border: "border-energy-orange/30", bg: "bg-energy-orange/5", badge: "bg-energy-orange/10 text-energy-orange" },
  info: { border: "border-energy-blue/30", bg: "bg-energy-blue/5", badge: "bg-energy-blue/10 text-energy-blue" },
};

const Alerts = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
        <p className="text-sm text-muted-foreground">Unusual electricity consumption notifications</p>
      </div>
      <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
        {alerts.filter((a) => a.type === "critical").length} Critical
      </span>
    </div>

    <div className="space-y-3">
      {alerts.map((alert, i) => {
        const style = typeStyles[alert.type];
        return (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-xl p-5 border ${style.border} ${style.bg} shadow-card`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${style.badge}`}>
                <alert.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-card-foreground">{alert.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
                    {alert.type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                <span className="text-xs text-muted-foreground">{alert.time}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
);

export default Alerts;
