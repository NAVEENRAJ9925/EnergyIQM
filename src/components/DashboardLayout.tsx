import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import TopNavbar from "@/components/TopNavbar";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* DESKTOP SIDEBAR (no fixed positioning) */}
      <AppSidebar />

      {/* MAIN COLUMN */}
      <div className="flex-1 flex flex-col">
        <TopNavbar />
        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="h-full rounded-3xl border border-white/5 bg-white/5/5 dark:bg-white/[0.02] backdrop-blur-xl shadow-[0_0_40px_rgba(15,23,42,0.55)]">
            <div className="h-full p-6 min-w-0">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
