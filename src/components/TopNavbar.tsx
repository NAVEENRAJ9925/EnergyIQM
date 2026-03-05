import { Bell, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const TopNavbar = () => {
  const { user } = useAuth();
  const [dark, setDark] = useState(false);

  const toggleTheme = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="h-14 border-b border-border bg-card/80 glass-effect flex items-center justify-between px-6 shrink-0">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Welcome back, {user?.name || "User"}</h2>
        <p className="text-xs text-muted-foreground">Monitor your energy consumption in real-time</p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors">
          {dark ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
        </button>
        <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
