const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  /** API key for ESP8266 to fetch device state (Bearer token or X-Device-Api-Key) */
  deviceApiKey: { type: String, default: null, sparse: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
