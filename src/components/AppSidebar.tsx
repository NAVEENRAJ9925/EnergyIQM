import {
  LayoutDashboard, BarChart3, Receipt, Brain, Power, Bell, User, LogOut, Zap, ChevronLeft, ChevronRight,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Energy Usage", url: "/energy", icon: BarChart3 },
  { title: "Bill Prediction", url: "/bill", icon: Receipt },
  { title: "AI Insights", url: "/insights", icon: Brain },
  { title: "Device Control", url: "/devices", icon: Power },
  { title: "Alerts", url: "/alerts", icon: Bell },
  { title: "Profile", url: "/profile", icon: User },
];

const AppSidebar = () => {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-all duration-300 shrink-0`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <div className="p-2 rounded-lg gradient-primary shrink-0">
          <Zap className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">EnergyIQ</h1>
            <p className="text-xs text-sidebar-foreground">IoT Energy Manager</p>
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
