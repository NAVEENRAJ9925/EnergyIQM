import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Shield, Download, Key, Copy, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEnergyData } from "@/hooks/useEnergyData";
import { api } from "@/lib/api";

const Profile = () => {
  const { user } = useAuth();
  const { history } = useEnergyData();
  const [deviceKey, setDeviceKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const exportCSV = () => {
    const headers = "Timestamp,Voltage,Current,Power,Energy,Frequency\n";
    const rows = history
      .filter((r) => r.timestamp)
      .map((r) => {
        const ts = r.timestamp ? r.timestamp.toISOString() : "";
        return `${ts},${r.voltage ?? ""},${r.current ?? ""},${r.power ?? ""},${r.energy ?? ""},${r.frequency ?? ""}`;
      })
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "energy_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl p-6 shadow-card border border-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">{user?.name}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium text-card-foreground">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-card-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Device</p>
              <p className="text-sm font-medium text-card-foreground">ESP8266 + PZEM-004T</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl p-6 shadow-card border border-border">
        <h3 className="text-sm font-semibold text-card-foreground mb-2 flex items-center gap-2">
          <Key className="h-4 w-4 text-primary" /> ESP Device API Key
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Use this key in your ESP8266 to sync relay state with the web app. Keep it private.
        </p>
        {deviceKey ? (
          <div className="flex flex-wrap items-center gap-2">
            <code className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-muted text-xs font-mono text-card-foreground break-all">
              {deviceKey}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(deviceKey);
              }}
              className="px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm flex items-center gap-1"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
            <button
              onClick={() => {
                setGenerating(true);
                api.device.generateKey().then((r) => {
                  setDeviceKey(r.deviceApiKey);
                  setGenerating(false);
                }).catch(() => setGenerating(false));
              }}
              disabled={generating}
              className="px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-sm flex items-center gap-1 disabled:opacity-50"
            >
              {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Regenerate
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setGenerating(true);
              api.device.generateKey().then((r) => {
                setDeviceKey(r.deviceApiKey);
                setGenerating(false);
              }).catch(() => setGenerating(false));
            }}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
            Generate device key
          </button>
        )}
      </motion.div>

      <button onClick={exportCSV}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
        <Download className="h-4 w-4" /> Export Energy Data as CSV
      </button>
    </div>
  );
};

export default Profile;
