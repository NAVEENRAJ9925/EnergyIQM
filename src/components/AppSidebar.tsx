import {
  LayoutDashboard, BarChart3, Receipt, Brain, Bell, User, LogOut, Zap, ChevronLeft, ChevronRight, Plug, Sparkles,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Energy Usage", url: "/energy", icon: BarChart3 },
  { title: "Bill Prediction", url: "/bill", icon: Receipt },
  { title: "AI Insights", url: "/insights", icon: Brain },
  { title: "Alerts", url: "/alerts", icon: Bell },
  { title: "Device Control", url: "/devices", icon: Plug },
  { title: "Profile", url: "/profile", icon: User },
];

const AppSidebar = () => {
  const { logout } = useAuth();
  // User preference for collapsed, plus hover state for smooth UX:
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isCollapsed = collapsed && !hovered;

  return (
    <motion.aside
      initial={{ width: collapsed ? 64 : 256 }}
      animate={{ width: isCollapsed ? 64 : 256 }}
      className={`bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-all duration-500 ease-out shadow-sm dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950/95 dark:to-slate-950 dark:border-slate-800/70 dark:shadow-[12px_0_45px_rgba(15,23,42,0.7)] relative overflow-hidden`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-cyan-500/5 opacity-0 hover:opacity-100 transition-opacity duration-700" />
      
      {/* Logo */}
      <div className="relative z-10 p-6 flex items-center gap-4 border-b border-sidebar-border dark:border-slate-800/80">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-2xl bg-gradient-to-br from-emerald-400 via-sky-400 to-cyan-300 shrink-0 shadow-glass relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse-slow" />
          <Zap className="relative h-6 w-6 text-slate-950" />
        </motion.div>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="overflow-hidden"
          >
            <h1 className="text-lg font-black text-sidebar-accent-foreground tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">Power Sense</h1>
            <p className="text-xs font-semibold text-sidebar-foreground/80 flex items-center gap-1">
              <Sparkles className="h-3 w-3 animate-pulse-glow" />
              IoT Energy Manager
            </p>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex-1 p-4 space-y-2">
        {navItems.map((item, index) => (
          <motion.div
            key={item.url}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <NavLink
              to={item.url}
              end
              className="group relative flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-medium text-sidebar-foreground hover:text-sidebar-accent-foreground transition-all duration-300 hover:bg-sidebar-accent hover:scale-105 overflow-hidden"
              activeClassName="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-500 font-bold shadow-glass dark:from-emerald-500/10 dark:to-cyan-500/10 dark:text-emerald-300 dark:shadow-[0_10px_30px_rgba(15,23,42,0.8)]"
            >
              {/* Active state gradient line */}
              <div className="absolute inset-y-2 left-2 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-400 opacity-0 group-[.active]:opacity-100 transition-all duration-300 group-[.active]:scale-y-110" />
              
              {/* Hover gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              
              <item.icon className="relative h-5 w-5 shrink-0 text-sidebar-foreground/70 group-hover:text-emerald-400 group-[.active]:text-emerald-400 transition-colors duration-300" />
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="relative font-semibold"
                >
                  {item.title}
                </motion.span>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Footer */}
      <div className="relative z-10 p-4 border-t border-sidebar-border dark:border-slate-800/80 space-y-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCollapsed((prev) => !prev)}
          className="group relative flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-300 w-full overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-sidebar-accent/50 to-sidebar-accent/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </motion.div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="relative font-semibold"
            >
              Collapse
            </motion.span>
          )}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="group relative flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-medium text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300 w-full overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-destructive/10 to-destructive/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="relative font-semibold"
            >
              Logout
            </motion.span>
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;
