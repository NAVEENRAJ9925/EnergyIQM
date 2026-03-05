import { useState, useEffect, useCallback } from "react";

export interface EnergyReading {
  timestamp: Date;
  voltage: number;
  current: number;
  power: number;
  energy: number;
  frequency: number;
}

const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

export const useEnergyData = () => {
  const [realtime, setRealtime] = useState<EnergyReading>({
    timestamp: new Date(),
    voltage: 230,
    current: 4.5,
    power: 1035,
    energy: 12.5,
    frequency: 50,
  });

  const [history, setHistory] = useState<EnergyReading[]>([]);

  const generateReading = useCallback((): EnergyReading => {
    const hour = new Date().getHours();
    const isPeak = hour >= 19 && hour <= 22;
    const basePower = isPeak ? randomInRange(800, 1500) : randomInRange(200, 700);
    const voltage = randomInRange(225, 240);
    const current = basePower / voltage;

    return {
      timestamp: new Date(),
      voltage: Math.round(voltage * 10) / 10,
      current: Math.round(current * 100) / 100,
      power: Math.round(basePower),
      energy: Math.round(randomInRange(0.1, 0.5) * 100) / 100,
      frequency: Math.round(randomInRange(49.8, 50.2) * 10) / 10,
    };
  }, []);

  useEffect(() => {
    // Initialize history with 24 hours of simulated data
    const initialHistory: EnergyReading[] = [];
    const now = new Date();
    for (let i = 288; i >= 0; i--) {
      const ts = new Date(now.getTime() - i * 5 * 60 * 1000);
      const hour = ts.getHours();
      const isPeak = hour >= 19 && hour <= 22;
      const basePower = isPeak ? randomInRange(800, 1500) : randomInRange(200, 700);
      const voltage = randomInRange(225, 240);
      initialHistory.push({
        timestamp: ts,
        voltage: Math.round(voltage * 10) / 10,
        current: Math.round((basePower / voltage) * 100) / 100,
        power: Math.round(basePower),
        energy: Math.round(randomInRange(0.1, 0.5) * 100) / 100,
        frequency: Math.round(randomInRange(49.8, 50.2) * 10) / 10,
      });
    }
    setHistory(initialHistory);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const reading = generateReading();
      setRealtime(reading);
      setHistory((prev) => [...prev.slice(-500), reading]);
    }, 5000);
    return () => clearInterval(interval);
  }, [generateReading]);

  const getDailyEnergy = useCallback(() => {
    const days: { day: string; energy: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        energy: Math.round(randomInRange(8, 25) * 10) / 10,
      });
    }
    return days;
  }, []);

  const getMonthlyEnergy = useCallback(() => {
    const months: { month: string; energy: number }[] = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 0; i < 12; i++) {
      months.push({ month: monthNames[i], energy: Math.round(randomInRange(200, 500)) });
    }
    return months;
  }, []);

  const getWeeklyEnergy = useCallback(() => {
    const weeks: { week: string; energy: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      weeks.push({ week: `Week ${4 - i}`, energy: Math.round(randomInRange(80, 180)) });
    }
    return weeks;
  }, []);

  return { realtime, history, getDailyEnergy, getMonthlyEnergy, getWeeklyEnergy };
};
