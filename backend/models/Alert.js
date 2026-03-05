const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: { type: String, enum: ['critical', 'warning', 'info'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  time: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

alertSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
