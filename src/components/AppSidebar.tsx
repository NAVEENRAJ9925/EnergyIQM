import {
  LayoutDashboard, BarChart3, Receipt, Brain, Bell, User, LogOut, Zap, ChevronLeft, ChevronRight, Plug,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-all duration-300 shrink-0 shadow-sm dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950/95 dark:to-slate-950 dark:border-slate-800/70 dark:shadow-[12px_0_45px_rgba(15,23,42,0.7)]`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border dark:border-slate-800/80">
        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-400 via-sky-400 to-cyan-300 shrink-0 shadow-[0_0_0_1px_rgba(15,23,42,0.7)]">
          <Zap className="h-5 w-5 text-slate-950" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">EnergyIQ</h1>
            <p className="text-xs text-sidebar-foreground/80">IoT Energy Manager</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end
            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:text-sidebar-accent-foreground transition-all duration-200 hover:bg-sidebar-accent relative overflow-hidden"
            activeClassName="bg-sidebar-accent text-emerald-500 font-medium shadow-sm dark:bg-slate-800/80 dark:text-emerald-300 dark:shadow-[0_10px_30px_rgba(15,23,42,0.8)]"
          >
            <span className="absolute inset-y-1 left-1 w-px rounded-full bg-gradient-to-b from-emerald-400/0 via-emerald-400/70 to-emerald-400/0 opacity-0 group-[.active]:opacity-100 group-hover:opacity-60 transition-opacity hidden dark:block" />
            <item.icon className="h-4 w-4 shrink-0 text-sidebar-foreground/70 group-hover:text-emerald-400 group-[.active]:text-emerald-400" />
            {!collapsed && <span className="relative">{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border dark:border-slate-800/80 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
