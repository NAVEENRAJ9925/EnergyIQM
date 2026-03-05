const mongoose = require('mongoose');

const energyReadingSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  voltage: { type: Number, required: true },
  current: { type: Number, required: true },
  power: { type: Number, required: true },
  energy: { type: Number, required: true },
  frequency: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

// Index for efficient queries on timestamp and userId
energyReadingSchema.index({ timestamp: -1 });
energyReadingSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('EnergyReading', energyReadingSchema);
