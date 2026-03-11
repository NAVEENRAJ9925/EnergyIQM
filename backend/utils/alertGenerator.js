const EnergyReading = require('../models/EnergyReading');
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
const USE_RULE_BASED_ALERTS = (process.env.ALERTS_RULE_BASED || '').toLowerCase() === 'true';

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

  const [readings, mlConsumption, mlBill, mlAnomalies, mlPeak, mlCarbon, mlRecs] = await Promise.all([
    EnergyReading.find({ ...match, timestamp: { $gte: startOfMonth } }).sort({ timestamp: -1 }).lean(),
    fetchML('/api/ml/predict-consumption', userId),
    fetchML('/api/ml/predict-bill', userId),
    fetchML('/api/ml/anomalies', userId),
    fetchML('/api/ml/peak-hours', userId),
    fetchML('/api/ml/carbon-footprint', userId),
    fetchML('/api/ml/recommendations', userId),
  ]);

  const alerts = [];

  const actualEnergyThisMonth = readings.reduce((s, r) => s + (r.energy || 0), 0);
  const latest = readings[0];
  const avgPower = readings.length ? readings.slice(0, 100).reduce((s, r) => s + (r.power || 0), 0) / Math.min(100, readings.length) : 0;

  // ML-based: monthly forecast + bill estimate
  // (Avoid generating "sample" alerts when ML cannot compute a prediction.)
  const predUnits = (mlConsumption && mlConsumption.predicted_units) || (mlBill && mlBill.predicted_units) || 0;
  const predConf = mlConsumption && typeof mlConsumption.confidence === 'number' ? mlConsumption.confidence : null;
  const predBill = mlBill && typeof mlBill.estimated_bill === 'number' ? mlBill.estimated_bill : null;
  if (predUnits > 0) {
    const pctUsed = predUnits > 0 ? Math.round((actualEnergyThisMonth / predUnits) * 100) : 0;
    const confText = predConf != null ? ` (confidence ${(predConf * 100).toFixed(0)}%)` : '';
    const billText = predBill != null ? ` Estimated bill: ₹${predBill.toFixed(0)}.` : '';

    alerts.push({
      type: pctUsed >= 100 ? 'critical' : pctUsed >= 85 ? 'warning' : 'info',
      title: 'Monthly Consumption Forecast (ML)',
      description: `Predicted monthly usage: ${Number(predUnits).toFixed(1)} units${confText}. Used so far: ${actualEnergyThisMonth.toFixed(1)} kWh (${pctUsed}%).${billText}`,
      time: 'This month',
      timestamp: now,
      data: {
        predicted_units: predUnits,
        confidence: predConf,
        estimated_bill: predBill,
        actual_energy_this_month: actualEnergyThisMonth,
        pct_used: pctUsed,
      },
      icon: 'TrendingUp',
    });
  }

  if (mlAnomalies && mlAnomalies.anomalies && mlAnomalies.anomalies.length > 0) {
    const top = mlAnomalies.anomalies[0];
    alerts.push({
      type: top.severity === 'high' ? 'critical' : 'warning',
      title: 'Unusual Power Spike Detected',
      description: `Power reached ${top.power} W (expected ~${top.expected} W). Check running appliances.`,
      time: formatTimeAgo(top.timestamp || now),
      timestamp: new Date(top.timestamp || now),
      data: {
        timestamp: top.timestamp,
        power: top.power,
        expected: top.expected,
        severity: top.severity,
      },
      icon: 'Zap',
    });
  }

  // ML-based: peak hours
  if (mlPeak && Array.isArray(mlPeak.peak_hours) && mlPeak.peak_hours.length > 0) {
    alerts.push({
      type: 'info',
      title: 'Peak Usage Hours',
      description: `Peak hours: ${mlPeak.peak_hours.join(', ')}. Avg peak power: ${mlPeak.avg_peak_power} W. Shift non-essential loads.`,
      time: 'Today',
      timestamp: now,
      data: {
        peak_hours: mlPeak.peak_hours,
        avg_peak_power: mlPeak.avg_peak_power,
      },
      icon: 'Clock',
    });
  }

  if (mlCarbon && mlCarbon.total_kwh > 0 && mlCarbon.vs_regional_avg === 'above') {
    alerts.push({
      type: 'info',
      title: 'Carbon Footprint',
      description: `${mlCarbon.co2_kg} kg CO₂ from ${mlCarbon.total_kwh} kWh. ${mlCarbon.pct_diff_from_avg}% above regional average.`,
      time: formatTimeAgo(now),
      timestamp: now,
      data: mlCarbon,
      icon: 'TrendingUp',
    });
  }

  // ML-based: recommendations as info alerts
  if (mlRecs && Array.isArray(mlRecs.recommendations) && mlRecs.recommendations.length > 0) {
    const top = mlRecs.recommendations.slice(0, 3);
    top.forEach((r, idx) => {
      alerts.push({
        type: 'info',
        title: idx === 0 ? 'Recommendations (ML)' : 'Recommendation (ML)',
        description: r.potential_saving ? `${r.tip} Potential saving: ${r.potential_saving}.` : r.tip,
        time: 'Today',
        timestamp: now,
        data: {
          tip: r.tip,
          potential_saving: r.potential_saving,
        },
        icon: 'AlertTriangle',
      });
    });
  }

  // Optional rule-based safety alerts (disabled by default).
  if (USE_RULE_BASED_ALERTS) {
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

    if (avgPower > 300 && readings.length > 50) {
      alerts.push({
        type: 'warning',
        title: 'High Baseline Consumption',
        description: `Average power ${avgPower.toFixed(0)} W. Unplug devices on standby to save energy.`,
        time: formatTimeAgo(now),
        icon: 'TrendingUp',
      });
    }
  }

  return alerts.slice(0, 20);
}

module.exports = { generateAlerts };
