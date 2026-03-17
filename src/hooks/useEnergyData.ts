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

const asFiniteNumberOrNull = (v: unknown) => {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

const asDateOrNull = (v: unknown) => {
  if (v == null) return null;
  const d = v instanceof Date ? v : new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
};

const mapReading = (r: {
  timestamp: string | null;
  voltage: number | null;
  current: number | null;
  power: number | null;
  energy: number | null;
  frequency: number | null;
  live?: boolean;
}): EnergyReading => ({
  timestamp: asDateOrNull(r.timestamp),
  voltage: asFiniteNumberOrNull(r.voltage),
  current: asFiniteNumberOrNull(r.current),
  power: asFiniteNumberOrNull(r.power),
  energy: asFiniteNumberOrNull(r.energy),
  frequency: asFiniteNumberOrNull(r.frequency),
  live: !!r.live,
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
  const [realtimeLoading, setRealtimeLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyData, setDailyData] = useState<{ day: string; energy: number }[]>(() => emptyDaily());
  const [weeklyData, setWeeklyData] = useState<{ week: string; energy: number }[]>(() => emptyWeekly());
  const [monthlyData, setMonthlyData] = useState<{ month: string; energy: number }[]>(() => emptyMonthly());

  useEffect(() => {
    let cancelled = false;
    const fetchRealtime = async () => {
      try {
        if (!cancelled) setRealtimeLoading(true);
        const r = await api.energy.realtime();
        if (!cancelled) {
          setError(null);
          setRealtime(mapReading(r));
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load live data");
      } finally {
        if (!cancelled) setRealtimeLoading(false);
      }
    };
    fetchRealtime();
    const interval = setInterval(fetchRealtime, 5000);
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchRealtime();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchHistory = async () => {
      try {
        if (!cancelled) setHistoryLoading(true);
        const raw = await api.energy.historyRaw(100);
        if (!cancelled) {
          setError(null);
          setHistory(raw.map(mapReading));
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load history");
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000);
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchHistory();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
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

  return {
    realtime,
    history,
    realtimeLoading,
    historyLoading,
    error,
    getDailyEnergy,
    getMonthlyEnergy,
    getWeeklyEnergy,
  };
};
