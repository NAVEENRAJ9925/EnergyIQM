import {
  LogOut,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { navItems } from "@/components/sidebar/navItems";

export default function AppSidebar() {
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen w-60 bg-slate-900 border-r border-slate-800 overflow-hidden",
        "text-slate-200 relative transition-all duration-300 ease-in-out",
      )}
    >

      {/* Logo / brand */}
      <div className="flex items-center gap-3 p-4 w-full justify-start border-b border-slate-800">
        <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-emerald-400 via-sky-400 to-cyan-300 flex items-center justify-center shrink-0">
          <Zap className="h-4 w-4 text-slate-950" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white leading-tight">Power Sense</div>
          <div className="text-[11px] text-slate-400 truncate">Smart Energy Hub</div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="mt-3 flex-1 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end
              className={cn(
                "flex items-center gap-3 rounded-lg cursor-pointer text-slate-300 hover:bg-slate-800/70 hover:text-slate-50 transition-colors",
                "px-4 py-2.5 justify-start",
              )}
              activeClassName="bg-slate-800 text-emerald-300"
            >
              <div className="h-9 w-9 rounded-2xl flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium truncate">{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom logout only */}
      <div className="mt-auto p-2 w-full border-t border-slate-800">
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 rounded-lg px-4 py-2.5 hover:bg-rose-500/10 transition-colors"
        >
          <div className="h-9 w-9 rounded-2xl flex items-center justify-center bg-rose-500/10 shrink-0">
            <LogOut className="h-5 w-5 text-rose-300" />
          </div>
          <span className="text-sm font-semibold text-rose-200">Logout</span>
        </button>
      </div>
    </aside>
  );
}