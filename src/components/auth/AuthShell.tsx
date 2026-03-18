import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px]"
      >
        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="px-6 pt-8 pb-6 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-sky-400 to-cyan-300 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-slate-950" />
              </div>
              <div className="min-w-0">
                <div className="text-slate-100 font-black tracking-tight">EnergyIQ</div>
                <div className="text-[11px] text-slate-400">Smart Energy Hub</div>
              </div>
            </div>
            <h1 className="mt-6 text-2xl font-black text-white tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          </div>

          <div className="p-6">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}

