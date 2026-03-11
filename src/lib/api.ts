// Full backend URL – backend has CORS enabled
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const ML_BASE = import.meta.env.VITE_ML_URL || "http://localhost:5001";

let token: string | null = localStorage.getItem("energyiq_token");

export function setToken(t: string | null) {
  token = t;
  if (t) localStorage.setItem("energyiq_token", t);
  else localStorage.removeItem("energyiq_token");
}

export function getToken() {
  return token ?? localStorage.getItem("energyiq_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const t = getToken();
  if (t) (headers as Record<string, string>)["Authorization"] = `Bearer ${t}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error || data.detail || res.statusText || "Request failed";
    throw new Error(typeof msg === "string" ? msg : "Request failed");
  }
  return data as T;
}

export const api = {
  auth: {
    register: (name: string, email: string, password: string) =>
      request<{ token: string; user: { id: string; name: string; email: string } }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      }),
    login: (email: string, password: string) =>
      request<{ token: string; user: { id: string; name: string; email: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
  },
  energy: {
    realtime: () =>
      request<{ timestamp: string; voltage: number; current: number; power: number; energy: number; frequency: number }>(
        "/energy/realtime"
      ),
    history: (range: "daily" | "weekly" | "monthly") =>
      request<{ day?: string; week?: string; month?: string; energy: number }[]>(
        `/energy/history?range=${range}`
      ),
    historyRaw: (limit = 100) =>
      request<
        { timestamp: string; voltage: number; current: number; power: number; energy: number; frequency: number }[]
      >(`/energy/history-raw?limit=${limit}`),
    bill: (units: number) => request<{ units: number; total: number }>(`/energy/bill?units=${units}`),
  },
  device: {
    list: () =>
      request<{ id: string; name: string; isOn: boolean }[]>("/device"),
    control: (device: string, state: boolean | "ON" | "OFF") =>
      request<{ id: string; name: string; isOn: boolean }>("/device/control", {
        method: "POST",
        body: JSON.stringify({ device, state }),
      }),
  },
  alerts: () =>
    request<
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
    >("/alerts"),
  alertsClear: () =>
    request<{ cleared: boolean; matched: number; modified: number }>("/alerts/clear", {
      method: "POST",
    }),
  alertsClearOne: (id: string) =>
    request<{ cleared: boolean; id: string }>(`/alerts/${id}/clear`, {
      method: "POST",
    }),
  alertsSendEmail: () =>
    request<{ sent: boolean; message?: string; reason?: string }>("/alerts/send-email", {
      method: "POST",
    }),

  ml: {
    predictConsumption: () =>
      request<{ predicted_units: number; confidence: number }>("/ml/predict-consumption"),
    predictBill: () =>
      request<{
        predicted_units: number;
        estimated_bill: number;
        breakdown: { slab: string; units: number; rate: number; cost: number }[];
      }>("/ml/predict-bill"),
    /** Fallback: fetch directly from ML service when backend proxy fails */
    predictBillDirect: async () => {
      const url = `${ML_BASE}/api/ml/predict-bill`;
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || res.statusText || "Request failed");
      return data as { predicted_units: number; estimated_bill: number; breakdown: { slab: string; units: number; rate: number; cost: number }[] };
    },
    peakHours: () =>
      request<{ peak_hours: string[]; avg_peak_power: number }>("/ml/peak-hours"),
    anomalies: () =>
      request<{
        anomalies: { timestamp: string; power: number; expected: number; severity: string }[];
      }>("/ml/anomalies"),
    recommendations: () =>
      request<{ recommendations: { tip: string; potential_saving: string }[] }>("/ml/recommendations"),
    carbonFootprint: () =>
      request<{
        total_kwh: number;
        co2_kg: number;
        co2_factor: number;
        vs_regional_avg: string;
        pct_diff_from_avg: number;
        regional_avg_kwh: number;
      }>("/ml/carbon-footprint"),
    /** Fallback: fetch directly from ML service */
    _direct: async (path: string) => {
  const url = `${ML_BASE}${path}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText || "Request failed");
  return data;
},
  },
};
