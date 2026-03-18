import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { navItems } from "@/components/sidebar/navItems";

export default function AppSidebar() {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isExpanded = useMemo(() => !collapsed || hovered, [collapsed, hovered]);
  const widthClass = collapsed ? "w-[70px]" : "w-60";

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen border-r border-slate-800 bg-slate-900",
        "bg-[#020617] dark:bg-[#020617] text-slate-200",
        "transition-[width] duration-300 ease-in-out",
        widthClass,
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Logo / brand */}
      <div className="flex items-center gap-3 px-3 py-4 border-b border-white/10">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-sky-400 to-cyan-300 flex items-center justify-center shrink-0">
          <Zap className="h-4 w-4 text-slate-950" />
        </div>
        <div className={cn("min-w-0 transition-all duration-300", isExpanded ? "opacity-100" : "opacity-0 w-0")}>
          <div className="text-sm font-black text-slate-50 leading-tight">EnergyIQ</div>
          <div className="text-[11px] text-slate-400 truncate">Smart Energy Hub</div>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className={cn(
            "ml-auto inline-flex items-center justify-center rounded-xl border border-white/10",
            "h-9 w-9 hover:bg-white/5 transition-colors",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4 text-slate-200" /> : <PanelLeftClose className="h-4 w-4 text-slate-200" />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="mt-3 flex-1 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const link = (
            <NavLink
              key={item.url}
              to={item.url}
              end
              className={cn(
                "group/nav flex items-center gap-3 rounded-2xl px-3 py-2.5",
                "text-slate-300 hover:bg-white/5 hover:text-slate-50 transition-colors",
              )}
              activeClassName="bg-white/6 text-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0",
                  "bg-white/0 group-hover/nav:bg-white/5 transition-colors",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn("text-sm font-semibold truncate", isExpanded ? "opacity-100" : "opacity-0 w-0")}>
                {item.title}
              </span>
            </NavLink>
          );

          // Tooltips only matter when fully collapsed (and not temporarily expanded via hover).
          if (!collapsed || hovered) return link;

          return (
            <Tooltip key={item.url} delayDuration={150}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right" className="border-white/10 bg-slate-950 text-slate-100">
                {item.title}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Bottom logout only */}
      <div className="mt-auto p-2 border-t border-white/10">
        <button
          type="button"
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-3 rounded-2xl px-3 py-2.5",
            "hover:bg-rose-500/10 transition-colors",
          )}
        >
          <div className="h-10 w-10 rounded-2xl flex items-center justify-center bg-rose-500/10 shrink-0">
            <LogOut className="h-5 w-5 text-rose-300" />
          </div>
          <span className={cn("text-sm font-semibold text-rose-200", isExpanded ? "opacity-100" : "opacity-0 w-0")}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}