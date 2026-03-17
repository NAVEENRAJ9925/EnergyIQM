const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  /**
   * Desired/target state from the web app. The ESP device should converge to this.
   * Kept as `isOn` for backwards compatibility with existing clients.
   */
  isOn: { type: Boolean, default: false },
  /** Last known state reported by the device (null until first report). */
  reportedIsOn: { type: Boolean, default: null },
  /** Last time the device was seen (poll/report). */
  lastSeenAt: { type: Date, default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Each user has their own devices; enforce uniqueness per user+name
deviceSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Device', deviceSchema);
