'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { nodeEnv, frontendUrl } = require('./config/env');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const compression = require('compression');
const { RedisStore } = require('rate-limit-redis');
const { redisClient } = require('./config/redis');

const app = express();

// Trust reverse proxy (Render/Heroku/Vercel) so rate limiters use the real client IP
app.set('trust proxy', 1);

// ── Performance ─────────────────────────────────────────────────────────────
app.use(compression());

// ── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet({ 
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'https://druxx-health-store.vercel.app',
  'https://drux.in',
  'https://www.drux.in'
];

if (frontendUrl) {
  allowedOrigins.push(frontendUrl);
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || nodeEnv !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'x-razorpay-signature', 
    'x-razorpay-event-id'
  ],
};
app.use(cors(corsOptions));

// ── Body Parsers ──────────────────────────────────────────────────────────────
// Razorpay Webhooks require the raw, un-parsed string to verify HMAC signatures
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

// All other routes use standard JSON parser
app.use(express.json({ limit: '1mb' })); // Restricted for production
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Static Uploads ────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// ── HTTP Logging ──────────────────────────────────────────────────────────────
if (nodeEnv !== 'test') {
  app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

// ── Rate Limiting ────────────────────────────────────────────────────────────
const { globalLimiter } = require('./middleware/rateLimit');
app.use('/api', globalLimiter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Druxx Health Store API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1/db-test', async (req, res) => {
  try {
    const prisma = require('./lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'success', message: 'Database connected successfully!' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message, stack: err.stack });
  }
});

app.get('/api/v1/email-test', async (req, res) => {
  try {
    const { getTransporter } = require('./lib/email');
    const transporter = getTransporter();

    // Check if SMTP configuration is present
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(400).json({
        status: 'error',
        message: 'SMTP credentials (SMTP_USER or SMTP_PASS) are not configured in environment variables.'
      });
    }

    console.log('[Email Test] Verifying SMTP transporter connection and credentials...');
    // Attempt to verify SMTP connection handshake and credentials
    await transporter.verify();

    console.log('[Email Test] Transporter verified. Sending test email...');
    // Attempt to send a test email to the configured user
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Drux Health Store" <druxindia@gmail.com>',
      to: process.env.SMTP_USER,
      subject: 'Drux Health Store — Live SMTP Test',
      html: '<h3>Live SMTP Test</h3><p>SMTP connection and credentials verified successfully on the backend server!</p>'
    });

    res.json({
      status: 'success',
      message: 'SMTP connection verified and test email sent successfully!',
      info: {
        messageId: info.messageId,
        response: info.response
      }
    });
  } catch (err) {
    console.error('[Email Test] SMTP Verification failed:', err);
    res.status(500).json({
      status: 'error',
      message: err.message,
      code: err.code,
      command: err.command,
      stack: err.stack
    });
  }
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Route ${req.originalUrl} not found on this server.`,
  });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
