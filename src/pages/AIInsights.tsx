import { Brain, TrendingUp, Clock, Lightbulb, Leaf, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const insights = [
  {
    icon: TrendingUp,
    title: "Predicted Monthly Consumption",
    value: "380 units",
    description: "Based on your usage pattern over the last 3 months, your predicted consumption is 380 units.",
    color: "text-energy-blue",
    bg: "bg-energy-blue/10",
  },
  {
    icon: BarChart3,
    title: "Estimated Electricity Bill",
    value: "₹810.00",
    description: "Your estimated TNEB bill for this month based on current consumption trends.",
    color: "text-energy-green",
    bg: "bg-energy-green/10",
  },
  {
    icon: Clock,
    title: "Peak Usage Hours",
    value: "7 PM – 10 PM",
    description: "Peak electricity usage occurs between 7 PM and 10 PM. Consider shifting non-essential loads.",
    color: "text-energy-orange",
    bg: "bg-energy-orange/10",
  },
  {
    icon: Lightbulb,
    title: "Energy Saving Tip",
    value: "Save up to 15%",
    description: "Switch to LED lighting and use appliances during off-peak hours to reduce consumption by 15%.",
    color: "text-energy-yellow",
    bg: "bg-energy-yellow/10",
  },
  {
    icon: Leaf,
    title: "Carbon Footprint",
    value: "285 kg CO₂",
    description: "Your monthly carbon footprint is 285 kg CO₂. That's 12% less than the regional average.",
    color: "text-energy-green",
    bg: "bg-energy-green/10",
  },
  {
    icon: Brain,
    title: "Anomaly Detection",
    value: "2 detected",
    description: "AI detected 2 unusual consumption spikes this week. Review alerts for details.",
    color: "text-energy-red",
    bg: "bg-energy-red/10",
  },
];

const recommendations = [
  "Run washing machine and dishwasher during off-peak hours (10 PM – 6 AM)",
  "Replace old AC with 5-star rated inverter AC to save 30% energy",
  "Use smart power strips to eliminate standby power consumption",
  "Set AC thermostat to 24°C instead of 20°C to save 20% cooling costs",
  "Install solar panels to offset 40-60% of your electricity consumption",
];

const AIInsights = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
      <p className="text-sm text-muted-foreground">Machine learning-powered energy analysis</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {insights.map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-card-hover transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${item.bg}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <span className="text-sm font-medium text-card-foreground">{item.title}</span>
          </div>
          <p className="text-xl font-bold font-mono text-card-foreground mb-2">{item.value}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
        </motion.div>
      ))}
    </div>

    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl p-6 shadow-card border border-border">
      <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-energy-yellow" /> Energy Saving Recommendations
      </h3>
      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <span className="text-xs font-bold text-primary mt-0.5">{i + 1}.</span>
            <p className="text-sm text-card-foreground">{rec}</p>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

export default AIInsights;
