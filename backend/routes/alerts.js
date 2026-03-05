const express = require('express');
const Alert = require('../models/Alert');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { generateAlerts } = require('../utils/alertGenerator');
const { sendAlertEmail } = require('../utils/email');

const router = express.Router();

const iconMap = { critical: 'Zap', warning: 'TrendingUp', info: 'AlertTriangle' };

// GET /api/alerts — ML + usage + bill based alerts
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    let alerts = await generateAlerts(userId);
    const dbAlerts = await Alert.find({ $or: [{ userId }, { userId: null }] })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    const merged = [
      ...alerts.map((a, i) => ({
        id: `gen-${i}`,
        type: a.type,
        title: a.title,
        description: a.description,
        time: a.time,
        icon: iconMap[a.type] || 'AlertTriangle',
      })),
      ...dbAlerts.map(a => ({
        id: a._id.toString(),
        type: a.type,
        title: a.title,
        description: a.description,
        time: a.time || formatTimeAgo(a.createdAt),
        icon: iconMap[a.type] || 'AlertTriangle',
      })),
    ];
    const seen = new Set();
    const unique = merged.filter(a => {
      const k = `${a.title}|${a.description}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    res.json(unique.slice(0, 50));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/alerts/send-email — send alert digest to user
router.post('/send-email', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).lean();
    if (!user || !user.email) {
      return res.status(400).json({ error: 'User email not found' });
    }
    const alerts = await generateAlerts(userId);
    if (alerts.length === 0) {
      return res.json({ sent: false, message: 'No alerts to send' });
    }
    const result = await sendAlertEmail(user.email, user.name || 'User', alerts);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

module.exports = router;
