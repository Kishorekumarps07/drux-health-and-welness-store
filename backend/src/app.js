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

// ── Performance ─────────────────────────────────────────────────────────────
app.use(compression());

// ── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet({ 
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: nodeEnv === 'production' ? frontendUrl : true,
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
