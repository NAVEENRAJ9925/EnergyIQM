const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    otpSalt: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    verifiedAt: { type: Date, default: null },
    resetTokenHash: { type: String, default: null },
    resetTokenSalt: { type: String, default: null },
    resetExpiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Auto-clean expired OTP docs (MongoDB TTL uses seconds precision)
passwordResetSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);

