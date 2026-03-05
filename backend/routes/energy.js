const express = require('express');
const EnergyReading = require('../models/EnergyReading');
const auth = require('../middleware/auth');

const router = express.Router();

// Tamil Nadu tariff logic for bill prediction
function calculateBill(units) {
  if (units <= 100) return 0;
  if (units <= 200) return (units - 100) * 2.25;
  if (units <= 400) return 100 * 2.25 + (units - 200) * 4.5;
  if (units <= 500) return 100 * 2.25 + 200 * 4.5 + (units - 400) * 6;
  return 100 * 2.25 + 200 * 4.5 + 100 * 6 + (units - 500) * 8;
}

// POST /api/energy/reading — ESP8266 pushes new reading (no auth)
router.post('/reading', async (req, res) => {
  try {
    const { voltage, current, power, energy, frequency } = req.body;
    if (voltage == null || current == null || power == null || energy == null || frequency == null) {
      return res.status(400).json({ error: 'voltage, current, power, energy, frequency are required' });
    }
    const reading = await EnergyReading.create({ voltage, current, power, energy, frequency });
    res.status(201).json(reading);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/energy/realtime — latest energy reading
router.get('/realtime', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const reading = await EnergyReading.findOne({ $or: [{ userId }, { userId: null }] })
      .sort({ timestamp: -1 })
      .lean();
    if (!reading) {
      return res.json({
        timestamp: new Date(),
        voltage: 230,
        current: 4.5,
        power: 1035,
        energy: 12.5,
        frequency: 50,
      });
    }
    reading.timestamp = reading.timestamp || reading.createdAt;
    res.json(reading);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/energy/history?range=daily|weekly|monthly
router.get('/history', auth, async (req, res) => {
  try {
    const range = req.query.range || 'daily';
    const userId = req.user.userId;

    const match = { $or: [{ userId }, { userId: null }] };
    const now = new Date();
    let startDate;

    if (range === 'daily') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'weekly') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 28);
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    match.timestamp = { $gte: startDate };

    const readings = await EnergyReading.find(match).sort({ timestamp: 1 }).lean();

    let result;
    if (range === 'daily') {
      const byDay = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        byDay[key] = { day: d.toLocaleDateString('en-US', { weekday: 'short' }), energy: 0 };
      }
      readings.forEach((r) => {
        const key = new Date(r.timestamp).toISOString().split('T')[0];
        if (byDay[key]) byDay[key].energy += r.energy || 0;
      });
      result = Object.values(byDay).map(({ day, energy }) => ({ day, energy: Math.round(energy * 100) / 100 }));
    } else if (range === 'weekly') {
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - i * 7);
        weeks.push({ week: `Week ${4 - i}`, energy: 0, start: weekStart });
      }
      readings.forEach((r) => {
        const d = new Date(r.timestamp);
        for (let i = 0; i < weeks.length; i++) {
          const w = weeks[i];
          const end = new Date(w.start);
          end.setDate(end.getDate() + 7);
          if (d >= w.start && d < end) {
            w.energy += r.energy || 0;
            break;
          }
        }
      });
      result = weeks.map(({ week, energy }) => ({ week, energy: Math.round(energy * 100) / 100 }));
    } else {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const byMonth = monthNames.map((month, i) => ({ month, energy: 0, index: i }));
      readings.forEach((r) => {
        const m = new Date(r.timestamp).getMonth();
        byMonth[m].energy += r.energy || 0;
      });
      result = byMonth.map(({ month, energy }) => ({ month, energy: Math.round(energy * 100) / 100 }));
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/energy/bill?units=380 — Tamil Nadu bill prediction
router.get('/bill', auth, (req, res) => {
  const units = parseFloat(req.query.units) || 0;
  const total = calculateBill(units);
  res.json({ units, total: Math.round(total * 100) / 100 });
});

// GET /api/energy/history-raw — raw readings for charts (last N points)
router.get('/history-raw', auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const userId = req.user.userId;
    const readings = await EnergyReading.find({ $or: [{ userId }, { userId: null }] })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    const reversed = readings.reverse().map((r) => ({
      ...r,
      timestamp: r.timestamp || r.createdAt,
    }));
    res.json(reversed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
