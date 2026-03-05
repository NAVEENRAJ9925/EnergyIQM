const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/energyiq';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/energy', require('./routes/energy'));
app.use('/api/device', require('./routes/device'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/ml', require('./routes/ml'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Debug: verify ML proxy route exists (no auth)
app.get('/api/ml/health', async (req, res) => {
  try {
    const r = await fetch(`${process.env.ML_SERVICE_URL || 'http://localhost:5001'}/api/ml/health`);
    const d = await r.json().catch(() => ({}));
    res.json({ backend: 'ok', ml: d });
  } catch (e) {
    res.status(502).json({ backend: 'ok', ml: 'unreachable', error: e.message });
  }
});

app.listen(PORT, () => console.log(`EnergyIQ API running on http://localhost:${PORT}`));
