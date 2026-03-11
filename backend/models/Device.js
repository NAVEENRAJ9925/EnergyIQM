const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isOn: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Each user has their own devices; enforce uniqueness per user+name
deviceSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Device', deviceSchema);
