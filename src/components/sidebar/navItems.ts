import {
  BarChart3,
  Bell,
  Brain,
  LayoutDashboard,
  Plug,
  Receipt,
  User,
} from "lucide-react";

export const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Energy Usage", url: "/energy", icon: BarChart3 },
  { title: "Bill Prediction", url: "/bill", icon: Receipt },
  { title: "AI Insights", url: "/insights", icon: Brain },
  { title: "Alerts", url: "/alerts", icon: Bell },
  { title: "Device Control", url: "/devices", icon: Plug },
  { title: "Profile", url: "/profile", icon: User },
] as const;

