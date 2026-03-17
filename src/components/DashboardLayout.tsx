import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import TopNavbar from "@/components/TopNavbar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#020617] dark:text-slate-200 relative overflow-x-hidden transition-colors">
      {/* Aurora gradient background (dark mode) */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.15),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.12),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.10),transparent_50%)] hidden dark:block" />

      {/* Fixed sidebar */}
      <AppSidebar />

      {/* Main content shifted to the width of collapsed sidebar.
          Sidebar expansion happens on top without increasing the gap. */}
      <div className="min-h-screen flex flex-col ml-0 md:ml-20 transition-[margin] duration-300 ease-in-out">
        <TopNavbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="h-full relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_40px_rgba(16,185,129,0.05)] hover:shadow-[0_0_60px_rgba(16,185,129,0.15)] transition-all duration-500">
            <div className="h-full p-4 sm:p-6 lg:p-8 min-w-0">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
