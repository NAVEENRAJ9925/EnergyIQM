import { Bell, Sun, Moon, Menu, Zap, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NavLink } from "@/components/NavLink";
import { navItems } from "@/components/sidebar/navItems";
import { cn } from "@/lib/utils";

const TopNavbar = () => {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(true);
  const navigate = useNavigate();

  // Initialize theme (default dark, but respect stored preference if present)
  useEffect(() => {
    const stored = window.localStorage.getItem("energyiq_theme");
    const shouldDark = stored ? stored === "dark" : true;
    setDark(shouldDark);
    document.documentElement.classList.toggle("dark", shouldDark);
  }, []);

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("energyiq_theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 border-b border-border/50 bg-card/90 dark:border-white/10 dark:bg-gradient-to-r dark:from-slate-950/90 dark:via-slate-900/85 dark:to-slate-950/90 backdrop-blur-2xl transition-all duration-500"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 min-w-0"
      >
        {/* Mobile sidebar trigger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-border/50 glass-effect hover-lift"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 text-foreground" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[18rem] bg-[#020617] text-slate-200 border-white/10">
              <SheetHeader className="px-4 py-4 border-b border-white/10">
                <SheetTitle className="flex items-center gap-3 text-slate-50">
                  <span className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-sky-400 to-cyan-300 flex items-center justify-center shrink-0">
                    <Zap className="h-4 w-4 text-slate-950" />
                  </span>
                  <span className="font-black">EnergyIQ</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="p-2 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.url}
                      to={item.url}
                      end
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-2.5",
                        "text-slate-300 hover:bg-white/5 hover:text-slate-50 transition-colors",
                      )}
                      activeClassName="bg-white/6 text-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
                    >
                      <div className="h-10 w-10 rounded-2xl flex items-center justify-center bg-white/0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-semibold">{item.title}</span>
                    </NavLink>
                  );
                })}
              </nav>
              <div className="mt-auto p-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-rose-500/10 transition-colors"
                >
                  <div className="h-10 w-10 rounded-2xl flex items-center justify-center bg-rose-500/10 shrink-0">
                    <LogOut className="h-5 w-5 text-rose-300" />
                  </div>
                  <span className="text-sm font-semibold text-rose-200">Logout</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
            Welcome back,
            <span className="ml-2 bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent font-black">
              {user?.name || "User"}
            </span>
          </h1>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="group relative p-3 rounded-2xl border border-border/50 glass-effect hover-lift overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
          <motion.div
            animate={{ rotate: dark ? 0 : 180 }}
            transition={{ duration: 0.5 }}
          >
            {dark ? <Sun className="relative h-5 w-5 text-amber-400" /> : <Moon className="relative h-5 w-5 text-blue-400" />}
          </motion.div>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/alerts")}
          className="group relative p-3 rounded-2xl border border-border/50 glass-effect hover-lift overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
          <Bell className="relative h-5 w-5 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
          <div className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-ping" />
          <div className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/profile")}
          className="group relative h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-sky-400 to-cyan-300 flex items-center justify-center text-sm font-black text-slate-950 shadow-glass hover:shadow-neon transition-all duration-300 overflow-hidden"
          aria-label="Profile"
        >
          <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          <span className="relative">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
        </motion.button>
      </motion.div>
    </motion.header>
  );
};

export default TopNavbar;
