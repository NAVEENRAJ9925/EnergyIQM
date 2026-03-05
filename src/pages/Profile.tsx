import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Shield, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useEnergyData } from "@/hooks/useEnergyData";

const Profile = () => {
  const { user } = useAuth();
  const { history } = useEnergyData();

  const exportCSV = () => {
    const headers = "Timestamp,Voltage,Current,Power,Energy,Frequency\n";
    const rows = history.map((r) =>
      `${r.timestamp.toISOString()},${r.voltage},${r.current},${r.power},${r.energy},${r.frequency}`
    ).join("\n");
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

      <button onClick={exportCSV}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
        <Download className="h-4 w-4" /> Export Energy Data as CSV
      </button>
    </div>
  );
};

export default Profile;
