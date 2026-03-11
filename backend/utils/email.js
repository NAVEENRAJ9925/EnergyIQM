const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true';
  if (!host || !user || !pass) {
    return null;
  }
  transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  return transporter;
}

async function sendAlertEmail(to, name, alerts) {
  const trans = getTransporter();
  if (!trans) {
    console.warn('Email not configured (SMTP_* env vars). Skipping send.');
    return { sent: false, reason: 'SMTP not configured' };
  }
  const critical = alerts.filter(a => a.type === 'critical');
  const warning = alerts.filter(a => a.type === 'warning');
  const info = alerts.filter(a => a.type === 'info');
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body{font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;}
h1{color:#16a34a;}
.alert{ padding:12px; margin:8px 0; border-radius:8px; }
.critical{background:#fef2f2;border-left:4px solid #dc2626;}
.warning{background:#fffbeb;border-left:4px solid #f59e0b;}
.info{background:#eff6ff;border-left:4px solid #2563eb;}
.title{font-weight:600;margin-bottom:4px;}
.time{font-size:12px;color:#666;}
</style></head>
<body>
  <h1>EnergyIQ Alerts</h1>
  <p>Hi ${name}, here are your energy consumption alerts:</p>
  ${critical.length ? `<h3>Critical (${critical.length})</h3>` : ''}
  ${critical.map(a => `<div class="alert critical"><div class="title">${a.title}</div><div>${a.description}</div><div class="time">${a.time}</div></div>`).join('')}
  ${warning.length ? `<h3>Warnings (${warning.length})</h3>` : ''}
  ${warning.map(a => `<div class="alert warning"><div class="title">${a.title}</div><div>${a.description}</div><div class="time">${a.time}</div></div>`).join('')}
  ${info.length ? `<h3>Info (${info.length})</h3>` : ''}
  ${info.map(a => `<div class="alert info"><div class="title">${a.title}</div><div>${a.description}</div><div class="time">${a.time}</div></div>`).join('')}
  <p style="margin-top:24px;color:#666;font-size:12px;">EnergyIQ Smart Energy Hub</p>
</body>
</html>`;
  const subject = critical.length > 0
    ? `EnergyIQ: ${critical.length} Critical Alert(s)`
    : `EnergyIQ: ${alerts.length} Energy Alert(s)`;

  try {
    await trans.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error('Failed to send alert email:', err);
    return {
      sent: false,
      reason: err && err.message ? err.message : 'Failed to send email',
    };
  }
}

module.exports = { sendAlertEmail, getTransporter };
