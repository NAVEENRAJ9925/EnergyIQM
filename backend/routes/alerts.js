const express = require('express');
const Alert = require('../models/Alert');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { generateAlerts } = require('../utils/alertGenerator');
const { sendAlertEmail } = require('../utils/email');

const router = express.Router();

const iconMap = { critical: 'Zap', warning: 'TrendingUp', info: 'AlertTriangle' };

// GET /api/alerts — ML-based alerts, persisted in MongoDB, only uncleared alerts for this user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1) Generate latest ML-driven alerts (in-memory)
    const generated = await generateAlerts(userId);

    // 2) Persist new alerts into MongoDB (dedupe by title + description + userId)
    for (const a of generated) {
      // Skip obviously empty/placeholder alerts
      if (!a || !a.title || !a.description) continue;
      // Avoid duplicates: same title+description for same user that is not cleared
      const exists = await Alert.findOne({
        userId: userId || null,
        title: a.title,
        description: a.description,
        cleared: false,
      }).lean();
      if (!exists) {
        await Alert.create({
          type: a.type,
          title: a.title,
          description: a.description,
          time: a.time || '',
          timestamp: a.timestamp || null,
          data: a.data || null,
          userId: userId || null,
        });
      }
    }

    // 3) Return only uncleared alerts for this user, newest first
    const dbAlerts = await Alert.find({
      userId,
      cleared: false,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const payload = dbAlerts.map((a) => {
      const ts = a.timestamp || a.createdAt;
      return {
        id: a._id.toString(),
        type: a.type,
        title: a.title,
        description: a.description,
        // Human-readable label for quick scanning
        time: formatTimeAgo(ts),
        // Exact ISO timestamp for precise display/debugging
        timestamp: ts ? ts.toISOString() : null,
        data: a.data || null,
        icon: iconMap[a.type] || 'AlertTriangle',
      };
    });

    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/alerts/clear — mark all alerts for the user as cleared
router.post('/clear', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await Alert.updateMany({ userId, cleared: false }, { $set: { cleared: true } });
    res.json({ cleared: true, matched: result.matchedCount ?? result.n, modified: result.modifiedCount ?? result.nModified });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/alerts/:id/clear — clear a specific alert for this user
router.post('/:id/clear', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const updated = await Alert.findOneAndUpdate(
      {
        _id: id,
        userId,
        cleared: false,
      },
      { $set: { cleared: true } },
      { new: true },
    );
    if (!updated) {
      return res.status(404).json({ error: 'Alert not found or already cleared' });
    }
    res.json({ cleared: true, id });
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
    const result = await sendAlertEmail("naveenraj9925@gmail.com", user.name || 'User', alerts);
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
