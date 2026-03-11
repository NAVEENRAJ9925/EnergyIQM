import { Bell, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TopNavbar = () => {
  const { user } = useAuth();
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
    <header className="h-14 flex items-center justify-between px-6 shrink-0 border-b border-border bg-card/80 dark:border-white/10 dark:bg-gradient-to-r dark:from-slate-950/80 dark:via-slate-900/80 dark:to-slate-950/80 backdrop-blur-xl transition-colors">
      <div>
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300/90">
            EnergyIQ Console
          </span>
        </div>
        <h2 className="text-sm font-semibold text-foreground">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
            {user?.name || "User"}
          </span>
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors shadow-sm"
        >
          {dark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
        </button>
        <button
          onClick={() => navigate("/alerts")}
          className="relative p-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors shadow-sm"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400" />
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 via-sky-400 to-cyan-300 flex items-center justify-center text-xs font-bold text-slate-950 shadow-[0_0_0_1px_rgba(15,23,42,0.25)] hover:shadow-md transition-shadow"
          aria-label="Profile"
        >
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
