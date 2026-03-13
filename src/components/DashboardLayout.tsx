import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import TopNavbar from "@/components/TopNavbar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors">
      {/* Enhanced animated background glows */}
      <div className="pointer-events-none absolute inset-0 hidden dark:block">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-48 h-96 w-96 rounded-full bg-gradient-to-br from-sky-500/16 to-purple-500/12 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-160px] left-1/2 h-96 w-[600px] -translate-x-1/2 rounded-[999px] bg-gradient-to-r from-emerald-500/16 via-teal-400/12 to-sky-500/16 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-energy-purple/18 to-energy-pink/14 blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />
          <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-auto">
            <div className="h-full rounded-3xl border border-border/50 bg-card/90 dark:border-white/8 dark:bg-gradient-to-br dark:from-slate-950/90 dark:via-slate-900/85 dark:to-slate-950/90 shadow-glass dark:shadow-[0_20px_60px_rgba(15,23,42,0.9)] backdrop-blur-2xl transition-all duration-500">
              <div className="h-full p-6 sm:p-8 lg:p-10">
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
