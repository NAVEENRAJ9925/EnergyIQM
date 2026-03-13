import {
  BarChart3,
  Bell,
  Brain,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Plug,
  Receipt,
  User,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Energy Usage", url: "/energy", icon: BarChart3 },
  { title: "Bill Prediction", url: "/bill", icon: Receipt },
  { title: "AI Insights", url: "/insights", icon: Brain },
  { title: "Alerts", url: "/alerts", icon: Bell },
  { title: "Device Control", url: "/devices", icon: Plug },
  { title: "Profile", url: "/profile", icon: User },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isCollapsed = collapsed && !hovered;

  return (
    <aside
      className={[
        "relative z-20 flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
        "dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950/95 dark:to-slate-950",
        "dark:border-slate-800/70 dark:shadow-[12px_0_45px_rgba(11,18,32,0.70)]",
        isCollapsed ? "w-16" : "w-64",
      ].join(" ")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border/80 dark:border-slate-800/80">
        <div className="relative p-2 rounded-xl shrink-0 bg-gradient-to-br from-emerald-400 via-sky-400 to-cyan-300">
          <div className="pointer-events-none absolute inset-0 rounded-xl blur-xl opacity-40 dark:opacity-60 bg-gradient-to-br from-emerald-400/60 via-sky-400/45 to-cyan-300/40" />
          <Zap className="relative h-5 w-5 text-slate-950" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-[13px] font-semibold tracking-tight text-sidebar-accent-foreground">
              EnergyIQ
            </h1>
            <p className="text-xs text-sidebar-foreground/75">Smart Energy Hub</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/90 hover:text-sidebar-accent-foreground transition-all duration-200 hover:bg-sidebar-accent relative overflow-hidden"
            activeClassName="bg-sidebar-accent text-emerald-300 font-medium shadow-sm dark:bg-slate-800/80 dark:text-emerald-200 dark:shadow-[0_10px_30px_rgba(11,18,32,0.85)]"
          >
            <span className="absolute inset-y-1 left-1 w-px rounded-full bg-gradient-to-b from-emerald-400/0 via-emerald-400/80 to-emerald-400/0 opacity-0 group-[.active]:opacity-100 group-hover:opacity-60 transition-opacity hidden dark:block" />
            <item.icon className="h-4 w-4 shrink-0 text-sidebar-foreground/70 group-hover:text-emerald-300 group-[.active]:text-emerald-300" />
            {!isCollapsed && <span className="relative">{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border/80 dark:border-slate-800/80 space-y-1">
        <button
          type="button"
          onClick={() => setCollapsed((p) => !p)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!isCollapsed && <span>Collapse</span>}
        </button>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

