const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const auth = require('../middleware/auth');

const router = express.Router();

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function randomOtp() {
  // 6-digit numeric OTP
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtpEmail({ to, otp }) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.FROM_EMAIL || user;

  if (!host || !port || !user || !pass || !from) {
    throw new Error('Email service not configured');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject: 'EnergyIQ password reset code',
    text: `Your EnergyIQ password reset code is: ${otp}\n\nThis code expires in 10 minutes.`,
    html: `
      <div style="font-family:Inter,system-ui,Segoe UI,Arial,sans-serif;line-height:1.5">
        <h2 style="margin:0 0 12px">Password reset</h2>
        <p style="margin:0 0 16px">Use this one-time code to reset your EnergyIQ password:</p>
        <div style="font-size:28px;font-weight:800;letter-spacing:6px;padding:14px 16px;border-radius:12px;background:#0b1220;color:#fff;display:inline-block">${otp}</div>
        <p style="margin:16px 0 0;color:#555">This code expires in 10 minutes.</p>
      </div>
    `,
  });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    const user = await User.findByIdAndUpdate(req.user.userId, { name: name.trim() }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user._id.toString(), name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password { email }
router.post('/forgot-password', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    // Always return ok to reduce account enumeration risk.
    if (!email) return res.json({ ok: true });

    const user = await User.findOne({ email }).lean();
    if (!user) return res.json({ ok: true });

    const otp = randomOtp();
    const salt = crypto.randomBytes(16).toString('hex');
    const otpHash = sha256Hex(`${salt}:${otp}`);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await PasswordReset.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          otpHash,
          otpSalt: salt,
          otpExpiresAt,
          attempts: 0,
          verifiedAt: null,
          resetTokenHash: null,
          resetTokenSalt: null,
          resetExpiresAt: null,
        },
      },
      { upsert: true, new: true },
    );

    await sendOtpEmail({ to: email, otp });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/verify-otp { email, otp } -> { resetToken }
router.post('/verify-otp', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const doc = await PasswordReset.findOne({ email });
    if (!doc) return res.status(400).json({ error: 'Invalid or expired code' });
    if (doc.otpExpiresAt && doc.otpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }
    if ((doc.attempts || 0) >= 5) {
      return res.status(429).json({ error: 'Too many attempts. Please request a new code.' });
    }

    const expected = sha256Hex(`${doc.otpSalt}:${otp}`);
    if (expected !== doc.otpHash) {
      doc.attempts = (doc.attempts || 0) + 1;
      await doc.save();
      return res.status(400).json({ error: 'Invalid code' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const salt = crypto.randomBytes(16).toString('hex');
    doc.verifiedAt = new Date();
    doc.resetTokenSalt = salt;
    doc.resetTokenHash = sha256Hex(`${salt}:${resetToken}`);
    doc.resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await doc.save();

    res.json({ resetToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password { email, resetToken, newPassword }
router.post('/reset-password', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const resetToken = String(req.body.resetToken || '').trim();
    const newPassword = String(req.body.newPassword || '');
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ error: 'Email, resetToken and newPassword are required' });
    }
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const doc = await PasswordReset.findOne({ email });
    if (!doc || !doc.resetTokenHash || !doc.resetTokenSalt) {
      return res.status(400).json({ error: 'Invalid or expired reset session' });
    }
    if (!doc.resetExpiresAt || doc.resetExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: 'Reset session expired. Please restart the flow.' });
    }

    const expected = sha256Hex(`${doc.resetTokenSalt}:${resetToken}`);
    if (expected !== doc.resetTokenHash) {
      return res.status(400).json({ error: 'Invalid reset session' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { $set: { password: hashedPassword } });
    await PasswordReset.deleteOne({ _id: doc._id });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
