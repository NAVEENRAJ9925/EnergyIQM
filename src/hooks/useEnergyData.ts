import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface EnergyReading {
  timestamp: Date | null;
  voltage: number | null;
  current: number | null;
  power: number | null;
  energy: number | null;
  frequency: number | null;
  live?: boolean;
}

const mapReading = (r: {
  timestamp: string | null;
  voltage: number | null;
  current: number | null;
  power: number | null;
  energy: number | null;
  frequency: number | null;
  live?: boolean;
}): EnergyReading => ({
  timestamp: r.timestamp ? new Date(r.timestamp) : null,
  voltage: r.voltage,
  current: r.current,
  power: r.power,
  energy: r.energy,
  frequency: r.frequency,
  live: r.live,
});

const emptyDaily = () => {
  const days: { day: string; energy: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ day: d.toLocaleDateString("en-US", { weekday: "short" }), energy: 0 });
  }
  return days;
};

const emptyWeekly = () =>
  Array.from({ length: 4 }, (_, i) => ({ week: `Week ${i + 1}`, energy: 0 }));

const emptyMonthly = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((month) => ({ month, energy: 0 }));
};

export const useEnergyData = () => {
  const [realtime, setRealtime] = useState<EnergyReading>({
    timestamp: null,
    voltage: null,
    current: null,
    power: null,
    energy: null,
    frequency: null,
    live: false,
  });

  const [history, setHistory] = useState<EnergyReading[]>([]);
  const [dailyData, setDailyData] = useState<{ day: string; energy: number }[]>(() => emptyDaily());
  const [weeklyData, setWeeklyData] = useState<{ week: string; energy: number }[]>(() => emptyWeekly());
  const [monthlyData, setMonthlyData] = useState<{ month: string; energy: number }[]>(() => emptyMonthly());

  useEffect(() => {
    let cancelled = false;
    const fetchRealtime = async () => {
      try {
        const r = await api.energy.realtime();
        if (!cancelled) setRealtime(mapReading(r));
      } catch {
        // Fallback: keep default
      }
    };
    fetchRealtime();
    const interval = setInterval(fetchRealtime, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchHistory = async () => {
      try {
        const raw = await api.energy.historyRaw(100);
        if (!cancelled) setHistory(raw.map(mapReading));
      } catch {
        // Keep existing or empty
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const data = await api.energy.history("daily");
        if (!cancelled) setDailyData(data.map((x) => ({ day: x.day ?? x.week ?? x.month ?? "", energy: x.energy })));
      } catch {
        if (!cancelled) setDailyData(emptyDaily());
      }
    };
    run();
    const interval = setInterval(run, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const data = await api.energy.history("weekly");
        if (!cancelled) setWeeklyData(data.map((x) => ({ week: x.week ?? x.day ?? x.month ?? "", energy: x.energy })));
      } catch {
        if (!cancelled) setWeeklyData(emptyWeekly());
      }
    };
    run();
    const interval = setInterval(run, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const data = await api.energy.history("monthly");
        if (!cancelled) setMonthlyData(data.map((x) => ({ month: x.month ?? x.day ?? x.week ?? "", energy: x.energy })));
      } catch {
        if (!cancelled) setMonthlyData(emptyMonthly());
      }
    };
    run();
    const interval = setInterval(run, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const getDailyEnergy = useCallback(() => dailyData, [dailyData]);
  const getWeeklyEnergy = useCallback(() => weeklyData, [weeklyData]);
  const getMonthlyEnergy = useCallback(() => monthlyData, [monthlyData]);

  return { realtime, history, getDailyEnergy, getMonthlyEnergy, getWeeklyEnergy };
};
