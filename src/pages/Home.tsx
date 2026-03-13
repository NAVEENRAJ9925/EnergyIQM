import { Link } from "react-router-dom";
import { Zap, BarChart3, Brain, Shield, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { 
    icon: Zap, 
    title: "Real-time Monitoring", 
    desc: "Track voltage, current, power, and energy from your PZEM-004T sensor in real-time.",
    gradient: "from-energy-green to-energy-cyan"
  },
  { 
    icon: BarChart3, 
    title: "Smart Analytics", 
    desc: "Visualize daily, weekly, and monthly consumption with interactive Chart.js graphs.",
    gradient: "from-energy-blue to-energy-purple"
  },
  { 
    icon: Brain, 
    title: "AI Predictions", 
    desc: "Get ML-powered bill predictions and energy saving recommendations.",
    gradient: "from-energy-purple to-energy-pink"
  },
  { 
    icon: Shield, 
    title: "Device Control", 
    desc: "Control relays and schedule appliances directly from your dashboard.",
    gradient: "from-energy-orange to-energy-yellow"
  },
];

const Home = () => (
  <div className="min-h-screen bg-background relative overflow-hidden">
    {/* Animated background elements */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-energy-green/20 to-energy-cyan/10 rounded-full blur-3xl animate-float" />
      <div className="absolute top-1/2 right-20 w-96 h-96 bg-gradient-to-br from-energy-purple/20 to-energy-pink/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-br from-energy-orange/20 to-energy-yellow/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
    </div>

    {/* Enhanced Navbar */}
    <nav className="relative z-10 flex items-center justify-between px-6 py-6 border-b border-border/50 backdrop-blur-xl bg-background/80">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <div className="relative p-2 rounded-2xl gradient-primary shadow-glass">
          <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse-slow" />
          <Zap className="relative h-6 w-6 text-primary-foreground" />
        </div>
        <span className="font-bold text-xl text-foreground">EnergyIQ</span>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex gap-4"
      >
        <Link 
          to="/login" 
          className="px-6 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-all duration-300 hover-lift glass-effect"
        >
          Login
        </Link>
        <Link 
          to="/register" 
          className="px-6 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-300 hover-lift shadow-glass"
        >
          Get Started
        </Link>
      </motion.div>
    </nav>

    {/* Enhanced Hero Section */}
    <section className="relative z-10 px-6 py-32 text-center max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-8"
      >
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 glass-effect">
          <Sparkles className="h-4 w-4 animate-pulse-glow" />
          <span>IoT-Powered Energy Management</span>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
        </div>
        
        <div className="space-y-6">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            <span className="text-foreground">Intelligent Energy</span>
            <br />
            <span className="text-gradient-primary bg-gradient-to-r from-energy-green via-energy-cyan to-energy-blue bg-clip-text text-transparent">Management System</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Monitor electricity consumption in real-time with ESP8266 & PZEM-004T. Get AI-powered insights, predict bills, and control devices from anywhere.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/register" 
            className="group relative px-8 py-4 rounded-2xl gradient-primary text-primary-foreground font-semibold text-lg transition-all duration-300 hover-lift shadow-glass overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Monitoring
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </Link>
          <Link 
            to="/login" 
            className="px-8 py-4 rounded-2xl border-2 border-border/50 text-foreground font-semibold text-lg hover:bg-muted/50 transition-all duration-300 hover-lift glass-effect"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </section>

    {/* Enhanced Features Section */}
    <section className="relative z-10 px-6 pb-32 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Powerful Features for
          <span className="text-gradient-primary ml-2">Smart Energy</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to monitor, analyze, and optimize your energy consumption
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.6 }}
            className="group relative"
          >
            <div className="relative h-full p-6 rounded-2xl glass-effect hover-lift border border-border/50 overflow-hidden">
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <div className="relative z-10">
                <div className={`relative p-3 rounded-xl bg-gradient-to-br ${f.gradient} w-fit mb-4`}>
                  <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse-slow" />
                  <f.icon className="relative h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-card-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
              
              {/* Hover glow effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${f.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-2xl`} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  </div>
);

export default Home;
