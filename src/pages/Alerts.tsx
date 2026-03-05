import { useState, useEffect } from "react";
import { AlertTriangle, Zap, Clock, TrendingUp, Loader2, Mail } from "lucide-react";
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
    { id: string; type: string; title: string; description: string; time: string; icon: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
          <p className="text-sm text-muted-foreground">ML-based insights, bill forecast &amp; usage notifications</p>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
              {criticalCount} Critical
            </span>
          )}
          <button
            onClick={handleSendEmail}
            disabled={sending || alerts.length === 0}
            className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Mail className="h-4 w-4" />
            {sending ? "Sending…" : "Send to email"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-energy-orange/30 bg-energy-orange/5 p-3 text-sm text-energy-orange">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-xl p-8 border border-border bg-card text-center text-muted-foreground">
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
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-xl p-5 border ${style.border} ${style.bg} shadow-card`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${style.badge}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-card-foreground">{alert.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
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
