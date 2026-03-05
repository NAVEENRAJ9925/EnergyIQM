import { Link } from "react-router-dom";
import { Zap, BarChart3, Brain, Shield } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Zap, title: "Real-time Monitoring", desc: "Track voltage, current, power, and energy from your PZEM-004T sensor in real-time." },
  { icon: BarChart3, title: "Smart Analytics", desc: "Visualize daily, weekly, and monthly consumption with interactive Chart.js graphs." },
  { icon: Brain, title: "AI Predictions", desc: "Get ML-powered bill predictions and energy saving recommendations." },
  { icon: Shield, title: "Device Control", desc: "Control relays and schedule appliances directly from your dashboard." },
];

const Home = () => (
  <div className="min-h-screen bg-background">
    {/* Navbar */}
    <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg gradient-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-foreground">EnergyIQ</span>
      </div>
      <div className="flex gap-3">
        <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
          Login
        </Link>
        <Link to="/register" className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          Get Started
        </Link>
      </div>
    </nav>

    {/* Hero */}
    <section className="px-6 py-24 text-center max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
          IoT-Powered Energy Management
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-6">
          Intelligent Energy <br />
          <span className="text-primary">Management System</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Monitor electricity consumption in real-time with ESP8266 & PZEM-004T. Get AI-powered insights, predict bills, and control devices from anywhere.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/register" className="px-6 py-3 rounded-lg gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
            Start Monitoring
          </Link>
          <Link to="/login" className="px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors">
            Sign In
          </Link>
        </div>
      </motion.div>
    </section>

    {/* Features */}
    <section className="px-6 pb-24 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl p-5 shadow-card border border-border"
          >
            <div className="p-2 rounded-lg bg-primary/10 w-fit mb-3">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-card-foreground mb-1">{f.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  </div>
);

export default Home;
