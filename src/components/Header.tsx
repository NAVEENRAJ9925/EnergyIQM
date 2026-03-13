import { Bell, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [q, setQ] = useState("");

  const initials = useMemo(() => {
    const n = user?.name?.trim();
    if (!n) return "U";
    const parts = n.split(/\s+/).filter(Boolean);
    return (parts[0]?.[0] ?? "U").toUpperCase();
  }, [user?.name]);

  return (
    <header className="sticky top-0 z-10 h-14 shrink-0 border-b border-border bg-card/60 backdrop-blur-xl">
      <div className="mx-auto flex h-full items-center gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="hidden md:flex min-w-0 flex-1">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search (coming soon)…"
                className="h-9 w-full rounded-xl border border-border bg-background/60 pl-9 pr-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/80 focus:bg-background focus:ring-2 focus:ring-ring"
                aria-label="Search"
              />
            </div>
          </div>

          <div className="md:hidden text-sm font-semibold tracking-tight text-foreground">
            EnergyIQ
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => navigate("/alerts")}
            className="group relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/60 shadow-sm backdrop-blur transition-colors hover:bg-card"
            aria-label="Notifications"
          >
            <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100 bg-gradient-to-br from-[hsl(var(--accent))/0.16] via-transparent to-[hsl(var(--primary))/0.14]" />
            <Bell className="relative h-4 w-4 text-muted-foreground" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-sky-400 to-cyan-300 text-[12px] font-bold text-slate-950 shadow-sm transition-shadow hover:shadow-md"
                aria-label="User menu"
              >
                <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100 bg-white/20" />
                <span className="relative">{initials}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">{user?.name ?? "User"}</div>
                <div className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>Dashboard</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

