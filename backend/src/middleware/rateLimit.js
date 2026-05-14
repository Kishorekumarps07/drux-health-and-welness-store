const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { redisClient } = require('../config/redis');
const { nodeEnv } = require('../config/env');

// Standard global API rate limiter (used in app.js)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: nodeEnv === 'production' ? 200 : 2000, // Increase to 2000 for development
  standardHeaders: true,
  legacyHeaders: false,
  store: (nodeEnv === 'production' && process.env.REDIS_URL) ? new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: 'drx:rl:global:',
  }) : undefined,
  message: { status: 'fail', message: 'Too many requests from this IP. Please try again later.' },
});

// Strict limiter for authentication routes (Login, Register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: nodeEnv === 'production' ? 20 : 100, // 20 attempts per 15 minutes in prod
  standardHeaders: true,
  legacyHeaders: false,
  store: (nodeEnv === 'production' && process.env.REDIS_URL) ? new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: 'drx:rl:auth:',
  }) : undefined,
  message: { status: 'fail', message: 'Too many login attempts. Please try again after 15 minutes.' },
});

// Moderate limiter for payment intents
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: nodeEnv === 'production' ? 5 : 50, // 5 payment intents per minute max
  standardHeaders: true,
  legacyHeaders: false,
  store: (nodeEnv === 'production' && process.env.REDIS_URL) ? new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: 'drx:rl:pay:',
  }) : undefined,
  message: { status: 'fail', message: 'Too many payment requests. Please wait a moment.' },
});

module.exports = {
  globalLimiter,
  authLimiter,
  paymentLimiter
};
