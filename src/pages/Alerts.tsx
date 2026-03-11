import { useState, useEffect } from "react";
import { AlertTriangle, Zap, Clock, TrendingUp, Loader2, Mail, X } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, typeof Zap> = {
  Zap,
  Clock,
  TrendingUp,
  AlertTriangle,
};

const typeStyles = {
  critical: {
    border: "border-destructive/30",
    bg: "bg-destructive/5",
    badge: "bg-destructive/10 text-destructive",
  },
  warning: {
    border: "border-energy-orange/30",
    bg: "bg-energy-orange/5",
    badge: "bg-energy-orange/10 text-energy-orange",
  },
  info: {
    border: "border-energy-blue/30",
    bg: "bg-energy-blue/5",
    badge: "bg-energy-blue/10 text-energy-blue",
  },
};

const Alerts = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<
    {
      id: string;
      type: string;
      title: string;
      description: string;
      time: string;
      icon: string;
      timestamp?: string | null;
      data?: unknown;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearingIds, setClearingIds] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.alerts()
      .then((data) => {
        if (!cancelled) setAlerts(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const reloadAlerts = () => {
    setLoading(true);
    setError(null);
    api
      .alerts()
      .then((data) => setAlerts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
          <p className="text-sm text-muted-foreground">Unusual electricity consumption notifications</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const criticalCount = alerts.filter((a) => a.type === "critical").length;
  const styleKeys = Object.keys(typeStyles) as (keyof typeof typeStyles)[];

  const formatExactTime = (ts?: string | null) => {
    if (!ts) return "";
    try {
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleString();
    } catch {
      return "";
    }
  };

  const handleSendEmail = async () => {
    setSending(true);
    try {
      const res = await api.alertsSendEmail();
      if (res.sent) {
        toast({ title: "Email sent", description: "Alert digest sent to your email." });
      } else {
        toast({ title: "No email sent", description: res.message || res.reason || "No alerts to send or SMTP not configured." });
      }
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Could not send email.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleClearAlerts = async () => {
    setClearing(true);
    try {
      const res = await api.alertsClear();
      if (res.cleared) {
        setAlerts([]);
        toast({ title: "Cleared", description: "All alerts have been cleared." });
      } else {
        toast({ title: "Nothing to clear", description: "No alerts were cleared." });
      }
    } catch (err) {
      toast({
        title: "Failed to clear alerts",
        description: err instanceof Error ? err.message : "Could not clear alerts.",
        variant: "destructive",
      });
    } finally {
      setClearing(false);
    }
  };

  const handleClearOne = async (id: string) => {
    setClearingIds((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await api.alertsClearOne(id);
      if (res.cleared) {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      toast({
        title: "Failed to clear alert",
        description: err instanceof Error ? err.message : "Could not clear this alert.",
        variant: "destructive",
      });
    } finally {
      setClearingIds((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-300 text-[11px] font-medium mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse-glow" />
            ALERT CENTER
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Smart{" "}
            <span className="bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
              Alerts &amp; Anomalies
            </span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ML-powered notifications for unusual usage, bill forecasts, and carbon footprint.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-semibold border border-rose-500/40">
              {criticalCount} Critical
            </span>
          )}
          <button
            onClick={handleClearAlerts}
            disabled={clearing || alerts.length === 0}
            className="px-4 py-2 rounded-lg border border-slate-700/80 bg-slate-950/70 text-xs sm:text-sm text-slate-300 hover:bg-slate-800/80 hover:text-slate-100 transition-colors disabled:opacity-50"
          >
            {clearing ? "Clearing…" : "Clear alerts"}
          </button>
          <button
            onClick={handleSendEmail}
            disabled={sending || alerts.length === 0}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-400 via-sky-400 to-cyan-300 text-slate-950 text-sm font-medium flex items-center gap-2 disabled:opacity-40 shadow-[0_10px_30px_rgba(56,189,248,0.5)]"
          >
            <Mail className="h-4 w-4" />
            {sending ? "Sending…" : "Send to email"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-2xl p-8 border border-border bg-card text-center text-muted-foreground shadow-card dark:border-white/5 dark:bg-slate-950/70 dark:text-slate-400 dark:shadow-[0_18px_45px_rgba(15,23,42,0.85)]">
            No alerts at the moment.
          </div>
        ) : (
          alerts.map((alert, i) => {
            const type = styleKeys.includes(alert.type as keyof typeof typeStyles)
              ? (alert.type as keyof typeof typeStyles)
              : "info";
            const style = typeStyles[type];
            const Icon = iconMap[alert.icon] || AlertTriangle;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`relative rounded-2xl p-5 border ${style.border} ${style.bg} shadow-[0_16px_40px_rgba(15,23,42,0.9)] overflow-hidden`}
              >
                <div className="pointer-events-none absolute inset-x-10 -top-16 h-40 bg-gradient-to-b from-white/8 via-transparent to-transparent blur-3xl" />
                <div className="relative flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${style.badge}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-card-foreground">{alert.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
                        {alert.type}
                      </span>
                      <button
                        onClick={() => handleClearOne(alert.id)}
                        disabled={!!clearingIds[alert.id]}
                        className="ml-auto inline-flex items-center justify-center rounded-full p-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-background/60 disabled:opacity-40"
                        aria-label="Clear alert"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{alert.time}</span>
                      {alert.timestamp && (
                        <span className="text-muted-foreground/80">
                          · {formatExactTime(alert.timestamp)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Alerts;
