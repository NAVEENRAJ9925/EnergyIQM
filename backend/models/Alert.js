const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: { type: String, enum: ['critical', 'warning', 'info'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  /**
   * Human-readable time label (e.g., "5 minutes ago").
   * For exact event time, use `timestamp` or `createdAt`.
   */
  time: { type: String, default: '' },
  /**
   * Exact event timestamp (e.g., ML anomaly time). Falls back to createdAt when absent.
   */
  timestamp: { type: Date, default: null },
  /**
   * Arbitrary structured data associated with the alert (e.g., power, expected, units, bill, etc.).
   */
  data: { type: mongoose.Schema.Types.Mixed, default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  /**
   * Whether the alert has been cleared/dismissed by the user.
   */
  cleared: { type: Boolean, default: false },
}, { timestamps: true });

alertSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
