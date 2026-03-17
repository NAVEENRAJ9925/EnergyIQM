const express = require('express');
const crypto = require('crypto');
const Device = require('../models/Device');
const User = require('../models/User');
const auth = require('../middleware/auth');
const authOrDevice = require('../middleware/authDevice');

const router = express.Router();

function isRecentlySeen(d, windowMs) {
  if (!d) return false;
  const ts = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(ts.getTime())) return false;
  return Date.now() - ts.getTime() <= windowMs;
}

const DEFAULT_DEVICES = [
  { name: 'Light', isOn: true },
  { name: 'Motor', isOn: false },
  { name: 'AC', isOn: false },
];

// Ensure default devices exist for a user
async function ensureDevices(userId) {
  for (const d of DEFAULT_DEVICES) {
    await Device.findOneAndUpdate(
      { name: d.name, userId },
      { $setOnInsert: { name: d.name, isOn: d.isOn, reportedIsOn: null, lastSeenAt: null, userId } },
      { upsert: true, new: true },
    );
  }
}

// POST /api/device/generate-key — generate device API key for ESP (JWT auth only)
router.post('/generate-key', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const deviceApiKey = crypto.randomBytes(32).toString('hex');
    await User.findByIdAndUpdate(userId, { deviceApiKey });
    res.json({ deviceApiKey });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/device — list devices (frontend JWT or ESP device key)
router.get('/', authOrDevice, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).lean();
    const online = isRecentlySeen(user?.lastReadingAt, 20000);
    let devices = await Device.find({ userId }).lean();
    if (devices.length === 0) {
      await ensureDevices(userId);
      devices = await Device.find({ userId }).lean();
    }
    res.json(
      devices.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        isOn: d.isOn, // desired state
        reportedIsOn: d.reportedIsOn ?? null,
        lastSeenAt: d.lastSeenAt ? new Date(d.lastSeenAt).toISOString() : null,
        isOnline: online,
        pending: d.reportedIsOn == null ? true : d.isOn !== d.reportedIsOn,
      })),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/device/control — toggle device ON/OFF (web JWT or ESP device key)
router.post('/control', authOrDevice, async (req, res) => {
  try {
    const { device, state } = req.body; // device: "Light" | "Motor" | "AC", state: true | false
    const deviceName = device || req.body.name;
    if (!deviceName) return res.status(400).json({ error: 'device name is required' });
    const userId = req.user.userId;
    const user = await User.findById(userId).lean();
    const online = isRecentlySeen(user?.lastReadingAt, 20000);
    if (!online) {
      return res.status(409).json({ error: 'Device appears offline. Try again once it reconnects.' });
    }

    let dev = await Device.findOne({ name: deviceName, userId });
    if (!dev) {
      dev = await Device.create({ name: deviceName, isOn: state === true || state === 'ON', userId });
    } else {
      const isOn = state === undefined ? !dev.isOn : (state === true || state === 'ON');
      dev.isOn = isOn;
      await dev.save();
    }
    res.json({
      id: dev._id.toString(),
      name: dev.name,
      isOn: dev.isOn,
      reportedIsOn: dev.reportedIsOn ?? null,
      pending: dev.reportedIsOn == null ? true : dev.isOn !== dev.reportedIsOn,
      isOnline: online,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/device/poll — ESP polls desired states (device API key recommended)
router.get('/poll', authOrDevice, async (req, res) => {
  try {
    const userId = req.user.userId;
    await Device.updateMany({ userId }, { $set: { lastSeenAt: new Date() } });
    const devices = await Device.find({ userId }).lean();
    res.json(
      devices.map((d) => ({
        name: d.name,
        desired: !!d.isOn,
      })),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/device/report — ESP reports actual state so UI stays accurate
router.post('/report', authOrDevice, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { device, isOn } = req.body;
    const deviceName = device || req.body.name;
    if (!deviceName) return res.status(400).json({ error: 'device name is required' });
    if (typeof isOn !== 'boolean') return res.status(400).json({ error: 'isOn boolean is required' });
    const dev = await Device.findOneAndUpdate(
      { name: deviceName, userId },
      { $set: { reportedIsOn: isOn, lastSeenAt: new Date() } },
      { new: true, upsert: true },
    );
    res.json({
      id: dev._id.toString(),
      name: dev.name,
      isOn: dev.isOn,
      reportedIsOn: dev.reportedIsOn ?? null,
      pending: dev.reportedIsOn == null ? true : dev.isOn !== dev.reportedIsOn,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
