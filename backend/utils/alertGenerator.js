const EnergyReading = require('../models/EnergyReading');
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

async function fetchML(path, userId) {
  try {
    const qs = userId ? `?userId=${userId}` : '';
    const r = await fetch(`${ML_URL}${path}${qs}`);
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

function formatTimeAgo(date) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}

async function generateAlerts(userId) {
  const match = { $or: [{ userId: userId || null }, { userId: null }] };
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const [readings, mlBill, mlAnomalies, mlPeak, mlCarbon] = await Promise.all([
    EnergyReading.find({ ...match, timestamp: { $gte: startOfMonth } }).sort({ timestamp: -1 }).lean(),
    fetchML('/api/ml/predict-bill', userId),
    fetchML('/api/ml/anomalies', userId),
    fetchML('/api/ml/peak-hours', userId),
    fetchML('/api/ml/carbon-footprint', userId),
  ]);

  const alerts = [];

  const actualEnergyThisMonth = readings.reduce((s, r) => s + (r.energy || 0), 0);
  const latest = readings[0];
  const avgPower = readings.length ? readings.slice(0, 100).reduce((s, r) => s + (r.power || 0), 0) / Math.min(100, readings.length) : 0;

  if (mlBill && mlBill.predicted_units > 0) {
    const predUnits = mlBill.predicted_units;
    const predBill = mlBill.estimated_bill;
    const pctUsed = actualEnergyThisMonth > 0 ? Math.round((actualEnergyThisMonth / predUnits) * 100) : 0;
    if (pctUsed >= 90 && actualEnergyThisMonth < predUnits) {
      alerts.push({
        type: 'warning',
        title: 'Approaching Predicted Monthly Consumption',
        description: `You've used ${actualEnergyThisMonth.toFixed(1)} kWh (${pctUsed}% of predicted ${predUnits} units). Estimated bill so far: ₹${predBill.toFixed(0)}.`,
        time: formatTimeAgo(now),
        icon: 'TrendingUp',
      });
    }
    if (actualEnergyThisMonth >= predUnits * 0.5) {
      alerts.push({
        type: 'info',
        title: 'Monthly Bill Forecast',
        description: `Predicted: ${predUnits} units, ₹${predBill.toFixed(0)}. Actual so far: ${actualEnergyThisMonth.toFixed(1)} kWh.`,
        time: formatTimeAgo(now),
        icon: 'AlertTriangle',
      });
    }
  }

  if (mlAnomalies && mlAnomalies.anomalies && mlAnomalies.anomalies.length > 0) {
    const top = mlAnomalies.anomalies[0];
    alerts.push({
      type: top.severity === 'high' ? 'critical' : 'warning',
      title: 'Unusual Power Spike Detected',
      description: `Power reached ${top.power} W (expected ~${top.expected} W). Check running appliances.`,
      time: formatTimeAgo(top.timestamp || now),
      icon: 'Zap',
    });
  }

  if (latest && latest.power > 1500) {
    alerts.push({
      type: 'critical',
      title: 'High Power Consumption',
      description: `Current power: ${latest.power} W. Consider reducing load during peak hours.`,
      time: formatTimeAgo(latest.timestamp || latest.createdAt),
      icon: 'Zap',
    });
  }

  if (latest && latest.voltage && (latest.voltage < 200 || latest.voltage > 250)) {
    alerts.push({
      type: 'critical',
      title: 'Voltage Fluctuation',
      description: `Voltage at ${latest.voltage} V. May damage sensitive equipment.`,
      time: formatTimeAgo(latest.timestamp || latest.createdAt),
      icon: 'Zap',
    });
  }

  if (mlPeak && mlPeak.avg_peak_power > 1000) {
    alerts.push({
      type: 'info',
      title: 'Peak Usage Hours',
      description: `Peak hours: ${(mlPeak.peak_hours || []).join(', ')}. Avg peak power: ${mlPeak.avg_peak_power} W. Shift non-essential loads.`,
      time: 'Today',
      icon: 'Clock',
    });
  }

  if (mlCarbon && mlCarbon.total_kwh > 0 && mlCarbon.vs_regional_avg === 'above') {
    alerts.push({
      type: 'info',
      title: 'Carbon Footprint',
      description: `${mlCarbon.co2_kg} kg CO₂ from ${mlCarbon.total_kwh} kWh. ${mlCarbon.pct_diff_from_avg}% above regional average.`,
      time: formatTimeAgo(now),
      icon: 'TrendingUp',
    });
  }

  if (avgPower > 300 && readings.length > 50) {
    alerts.push({
      type: 'warning',
      title: 'High Baseline Consumption',
      description: `Average power ${avgPower.toFixed(0)} W. Unplug devices on standby to save energy.`,
      time: formatTimeAgo(now),
      icon: 'TrendingUp',
    });
  }

  return alerts.slice(0, 20);
}

module.exports = { generateAlerts };
