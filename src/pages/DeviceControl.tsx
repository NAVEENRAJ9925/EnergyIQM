import { useState, useEffect } from "react";
import { Power, Lightbulb, Fan, Snowflake, Clock, Plus, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

const iconMap: Record<string, typeof Lightbulb> = {
  Light: Lightbulb,
  Motor: Fan,
  AC: Snowflake,
};

interface Device {
  id: string;
  name: string;
  isOn: boolean;
}

interface Schedule {
  id: string;
  device: string;
  action: "ON" | "OFF";
  time: string;
}

const DeviceControl = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([
    { id: "1", device: "Motor", action: "ON", time: "06:00" },
    { id: "2", device: "Motor", action: "OFF", time: "06:30" },
  ]);

  const [newDevice, setNewDevice] = useState("");
  const [newTime, setNewTime] = useState("08:00");
  const [newAction, setNewAction] = useState<"ON" | "OFF">("ON");

  useEffect(() => {
    const load = () => {
      api.device.list()
        .then((data) => {
          setError(null);
          setDevices(
            data.length > 0
              ? data.map((d) => ({ ...d, icon: iconMap[d.name] || Lightbulb }))
              : [
                  { id: "1", name: "Light", isOn: true },
                  { id: "2", name: "Motor", isOn: false },
                  { id: "3", name: "AC", isOn: false },
                ]
          );
        })
        .catch((err) => {
          setError(err.message);
          setDevices([
            { id: "1", name: "Light", isOn: true },
            { id: "2", name: "Motor", isOn: false },
            { id: "3", name: "AC", isOn: false },
          ]);
        });
    };
    load();
    setLoading(false);
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const toggleDevice = async (id: string) => {
    const d = devices.find((x) => x.id === id);
    if (!d) return;
    const newState = !d.isOn;
    setDevices((prev) => prev.map((x) => (x.id === id ? { ...x, isOn: newState } : x)));
    try {
      const res = await api.device.control(d.name, newState);
      setDevices((prev) => prev.map((x) => (x.id === res.id || x.name === res.name ? { ...x, isOn: res.isOn, id: res.id } : x)));
    } catch {
      setDevices((prev) => prev.map((x) => (x.id === id ? { ...x, isOn: !newState } : x)));
    }
  };

  const addSchedule = () => {
    if (!newDevice) return;
    setSchedules((prev) => [
      ...prev,
      { id: Date.now().toString(), device: newDevice, action: newAction, time: newTime },
    ]);
  };

  const removeSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Device Control</h1>
          <p className="text-sm text-muted-foreground">Control appliances connected through relays</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Device Control</h1>
        <p className="text-sm text-muted-foreground">Control appliances connected through relays</p>
      </div>
      {error && (
        <div className="rounded-lg border border-energy-orange/30 bg-energy-orange/5 p-3 text-sm text-energy-orange">
          {error} — Showing cached state.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {devices.map((device, i) => {
          const Icon = iconMap[device.name] || Lightbulb;
          return (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl p-6 shadow-card border border-border transition-all cursor-pointer ${
                device.isOn ? "bg-primary/5 border-primary/30 energy-glow" : "bg-card"
              }`}
              onClick={() => toggleDevice(device.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${device.isOn ? "bg-primary/10" : "bg-muted"}`}>
                  <Icon className={`h-6 w-6 ${device.isOn ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className={`relative w-12 h-6 rounded-full transition-colors ${device.isOn ? "bg-primary" : "bg-muted"}`}>
                  <div className={`absolute top-1 h-4 w-4 rounded-full bg-card shadow transition-transform ${device.isOn ? "translate-x-7" : "translate-x-1"}`} />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-card-foreground">{device.name}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Power className={`h-3 w-3 ${device.isOn ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-xs font-medium ${device.isOn ? "text-primary" : "text-muted-foreground"}`}>
                  {device.isOn ? "ON" : "OFF"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" /> Scheduling
        </h3>
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={newDevice}
            onChange={(e) => setNewDevice(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
          >
            <option value="">Select Device</option>
            {devices.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
          <select
            value={newAction}
            onChange={(e) => setNewAction(e.target.value as "ON" | "OFF")}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
          >
            <option value="ON">ON</option>
            <option value="OFF">OFF</option>
          </select>
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
          />
          <button
            onClick={addSchedule}
            className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-1"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {schedules.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-card-foreground">{s.device}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    s.action === "ON" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {s.action}
                </span>
                <span className="text-sm font-mono text-muted-foreground">{s.time}</span>
              </div>
              <button onClick={() => removeSchedule(s.id)} className="p-1 hover:bg-destructive/10 rounded">
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeviceControl;
