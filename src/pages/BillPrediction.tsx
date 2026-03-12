import { useState, useEffect } from "react";
import { Receipt, TrendingUp, Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

const calculateTNEBBill = (units: number) => {
  const breakdown: { slab: string; units: number; rate: number; cost: number }[] = [];
  let remaining = units;
  let total = 0;
  const slabs = [
    { label: "0 – 100 units", limit: 100, rate: 0 },
    { label: "101 – 200 units", limit: 100, rate: 2.25 },
    { label: "201 – 400 units", limit: 200, rate: 4.5 },
    { label: "401 – 500 units", limit: 100, rate: 6 },
    { label: "Above 500 units", limit: Infinity, rate: 8 },
  ];
  for (const slab of slabs) {
    if (remaining <= 0) break;
    const consumed = Math.min(remaining, slab.limit);
    const cost = consumed * slab.rate;
    breakdown.push({ slab: slab.label, units: consumed, rate: slab.rate, cost });
    total += cost;
    remaining -= consumed;
  }
  return { breakdown, total };
};

const BillPrediction = () => {
  const [units, setUnits] = useState<number | null>(null);
  const [mlData, setMlData] = useState<{
    predicted_units: number;
    estimated_bill: number;
    breakdown: { slab: string; units: number; rate: number; cost: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const load = async () => {
      try {
        const data = await api.ml.predictBill();
        if (!cancelled) {
          setMlData(data);
          setUnits(data.predicted_units);
        }
      } catch (err) {
        if (!cancelled) {
          setMlData(null);
          setUnits(0);
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const { breakdown, total } = units !== null ? calculateTNEBBill(units) : { breakdown: [] as { slab: string; units: number; rate: number; cost: number }[], total: 0 };
  const isFromMl = mlData && units === mlData.predicted_units;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Electricity Bill Prediction</h1>
          <p className="text-sm text-muted-foreground">Tamil Nadu Electricity Board (TNEB) tariff calculator</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Electricity Bill Prediction</h1>
          <p className="text-sm text-muted-foreground">Tamil Nadu Electricity Board (TNEB) tariff calculator</p>
        </div>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-destructive">
          {error}. Ensure both backend (npm run api) and ML service (npm run ml) are running.
        </div>
        {/* Fallback manual calculator */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <p className="text-sm text-muted-foreground mb-4">Manual calculator (no ML data)</p>
          <label className="text-sm font-medium text-card-foreground block mb-2">Units (kWh)</label>
          <input
            type="range"
            min={0}
            max={1000}
            value={units ?? 0}
            onChange={(e) => setUnits(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <p className="mt-2 text-lg font-mono font-bold">{units} kWh → ₹{total.toFixed(2)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Electricity Bill Prediction</h1>
        <p className="text-sm text-muted-foreground">
          ML-predicted monthly consumption &amp; TNEB tariff calculator
        </p>
      </div>

      {/* Fixed model prediction with diagrammatic bars */}
      {mlData && (
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <p className="text-xs font-semibold text-energy-green uppercase tracking-wide mb-1">
            Model prediction
          </p>
          <p className="text-sm text-muted-foreground mb-5">
            Based on your last 90 days of usage.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">Predicted units</span>
                <span className="text-lg font-bold font-mono text-primary">
                  {mlData.predicted_units.toFixed(1)} kWh
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (mlData.predicted_units / 1000) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">0 kWh</span>
                <span className="text-[10px] text-muted-foreground">1000 kWh</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">Predicted bill</span>
                <span className="text-lg font-bold font-mono text-primary">
                  ₹{mlData.estimated_bill.toFixed(2)}
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (mlData.estimated_bill / 5000) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">₹0</span>
                <span className="text-[10px] text-muted-foreground">₹5000</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slider - explore different unit values */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <label className="text-sm font-medium text-card-foreground block mb-2">
          Units Consumed (kWh) — adjust to explore &quot;what if&quot; scenarios
        </label>
        <input
          type="range"
          min={0}
          max={1000}
          value={units ?? 0}
          onChange={(e) => setUnits(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-muted-foreground">0 kWh</span>
          <span className="text-lg font-bold font-mono text-primary">{units} kWh</span>
          <span className="text-xs text-muted-foreground">1000 kWh</span>
        </div>
        {isFromMl && mlData && (
          <p className="text-xs text-energy-green mt-2">
            Predicted from your last 90 days of usage (confidence based on ML model)
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-xl p-6 shadow-card border border-border"
        >
          <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" /> Bill Breakdown
          </h3>
          <div className="space-y-3">
            {breakdown.map((item) => (
              <div
                key={item.slab}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-card-foreground">{item.slab}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.units} units × ₹{item.rate}
                  </p>
                </div>
                <span
                  className={`text-sm font-mono font-semibold ${item.rate === 0 ? "text-energy-green" : "text-card-foreground"}`}
                >
                  {item.rate === 0 ? "FREE" : `₹${item.cost.toFixed(2)}`}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-xl p-6 shadow-card border border-border"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-energy-green/10">
                <Zap className="h-5 w-5 text-energy-green" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Units Consumed</p>
                <p className="text-3xl font-bold font-mono text-card-foreground">{units}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-xl p-6 shadow-card border border-border gradient-primary"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary-foreground/20">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <p className="text-sm text-primary-foreground/80">Total Electricity Cost</p>
            </div>
            <p className="text-4xl font-bold font-mono text-primary-foreground">₹{total.toFixed(2)}</p>
            <p className="text-xs text-primary-foreground/60 mt-1">Based on TNEB domestic tariff</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BillPrediction;
