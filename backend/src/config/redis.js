const { createClient } = require('redis');
const logger = require('./logger');

let redisClient = {
  on: () => {},
  connect: async () => {},
  sendCommand: async () => {}
};

if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on('error', (err) => logger.error('Redis Client Error', err));
  redisClient.on('connect', () => logger.info('Redis client connected'));
  redisClient.on('reconnecting', () => logger.info('Redis client reconnecting'));
  redisClient.on('ready', () => logger.info('Redis client ready to receive commands'));
}

const connectRedis = async () => {
  try {
    if (process.env.REDIS_URL) {
      await redisClient.connect();
    }
  } catch (error) {
    logger.error('Failed to connect to Redis', error);
  }
};

module.exports = {
  redisClient,
  connectRedis,
};
