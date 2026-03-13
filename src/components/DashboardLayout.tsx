import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden transition-colors">
      <div className="pointer-events-none absolute inset-0 hidden dark:block">
        <div className="absolute -top-36 -left-36 h-80 w-80 rounded-full bg-emerald-500/14 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-48 h-96 w-96 rounded-full bg-sky-500/12 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-120px] left-1/2 h-72 w-[560px] -translate-x-1/2 rounded-[999px] bg-gradient-to-r from-emerald-500/10 via-teal-400/8 to-sky-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="h-full rounded-2xl border border-border bg-card/55 shadow-card backdrop-blur-xl transition-colors dark:border-white/6 dark:bg-slate-950/35">
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
