import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import TopNavbar from "@/components/TopNavbar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors">
      {/* Animated background glows (dark mode only to keep light theme clean/readable) */}
      <div className="pointer-events-none absolute inset-0 hidden dark:block">
        <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-emerald-500/18 blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 -right-40 h-80 w-80 rounded-full bg-sky-500/14 blur-3xl animate-pulse-slower" />
        <div className="absolute bottom-[-120px] left-1/2 h-72 w-[520px] -translate-x-1/2 rounded-[999px] bg-gradient-to-r from-emerald-500/14 via-teal-400/10 to-sky-500/14 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="h-full rounded-2xl border border-border bg-card/80 dark:border-white/5 dark:bg-gradient-to-br dark:from-slate-950/80 dark:via-slate-900/80 dark:to-slate-950/80 shadow-sm dark:shadow-[0_18px_45px_rgba(15,23,42,0.8)] backdrop-blur-xl transition-colors">
              <div className="h-full p-4 sm:p-6 lg:p-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
