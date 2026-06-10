'use strict';

const nodemailer = require('nodemailer');

// ── Transporter (created once, reused) ───────────────────────────────────────
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // TLS via STARTTLS on port 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return _transporter;
}

// ── sendEmail ─────────────────────────────────────────────────────────────────
/**
 * Send a transactional email.
 * This is fire-and-forget — it NEVER throws. Errors are only logged.
 *
 * @param {Object} options
 * @param {string|string[]} options.to      - Recipient email(s)
 * @param {string}          options.subject - Email subject line
 * @param {string}          options.html    - HTML body content
 * @returns {Promise<void>}
 */
async function sendEmail({ to, subject, html }) {
  // Skip silently if SMTP credentials are not configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Email] SMTP_USER or SMTP_PASS not set — email skipped:', subject);
    return;
  }

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Drux Health Store" <druxindia@gmail.com>',
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
    });
    console.log(`[Email] Sent "${subject}" to ${to} — MessageId: ${info.messageId}`);
  } catch (err) {
    console.error(`[Email] Failed to send "${subject}" to ${to}:`, err.message);
    // Intentionally NOT re-throwing — email failure must never crash an order
  }
}

module.exports = { sendEmail };
