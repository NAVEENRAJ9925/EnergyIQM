const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

router.use(auth);

async function proxy(req, res, endpoint) {
  try {
    const userId = req.user.userId;
    const qs = new URLSearchParams({ userId: String(userId), ...req.query });
    const url = `${ML_URL}${endpoint}?${qs.toString()}`;
    const response = await fetch(url);
    let data;
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      return res.status(502).json({
        error: 'ML service error',
        detail: `Run from ml-service: cd ml-service && python app.py. Response: ${(text || response.statusText).slice(0, 150)}`,
      });
    }
    res.status(response.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'ML service unavailable', detail: err.message });
  }
}

router.get('/predict-consumption', (req, res) => proxy(req, res, '/api/ml/predict-consumption'));
router.get('/predict-bill', (req, res) => proxy(req, res, '/api/ml/predict-bill'));
router.get('/peak-hours', (req, res) => proxy(req, res, '/api/ml/peak-hours'));
router.get('/anomalies', (req, res) => proxy(req, res, '/api/ml/anomalies'));
router.get('/recommendations', (req, res) => proxy(req, res, '/api/ml/recommendations'));
router.get('/carbon-footprint', (req, res) => proxy(req, res, '/api/ml/carbon-footprint'));

module.exports = router;
