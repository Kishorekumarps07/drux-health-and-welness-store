'use strict';

const { port, nodeEnv } = require('./src/config/env');
const logger = require('./src/config/logger');
const prisma = require('./src/lib/prisma');
const app = require('./src/app');
const { connectRedis } = require('./src/config/redis');

async function bootstrap() {
  // Test DB connection
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
    
    await connectRedis();
  } catch (err) {
    logger.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  const server = app.listen(port, () => {
    logger.info(`🚀 Druxx Health Store API running in ${nodeEnv} mode on port ${port}`);
    logger.info(`📡 Base URL: http://localhost:${port}/api/v1`);
  });

  // ── Graceful Shutdown ────────────────────────────────────────────────────
  const shutdown = async (signal) => {
    logger.info(`${signal} received. Closing server gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('💤 Server closed and DB disconnected.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // ── Unhandled Rejections ─────────────────────────────────────────────────
  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });
}

bootstrap();
