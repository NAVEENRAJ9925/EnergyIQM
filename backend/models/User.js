const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  /** API key for ESP8266 to fetch device state (Bearer token or X-Device-Api-Key) */
  deviceApiKey: { type: String, default: null, sparse: true },
  /** Updated when the device posts a new energy reading (used as a heartbeat). */
  lastReadingAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
