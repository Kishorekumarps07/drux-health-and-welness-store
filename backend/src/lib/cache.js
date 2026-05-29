const { redisClient } = require('../config/redis');
const logger = require('../config/logger');

// Fallback in-memory store
const memoryStore = new Map();

const Cache = {
  /**
   * Retrieve a key from cache.
   * Automatically handles JSON parsing for objects/arrays.
   */
  async get(key) {
    if (process.env.REDIS_URL && redisClient.isOpen) {
      try {
        const val = await redisClient.get(key);
        return val ? JSON.parse(val) : null;
      } catch (err) {
        logger.error(`Redis GET error for key ${key}:`, err);
      }
    }
    // Fallback to in-memory cache
    const entry = memoryStore.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.value;
    }
    if (entry) {
      memoryStore.delete(key);
    }
    return null;
  },

  /**
   * Save a key/value pair to cache with a Time-To-Live (TTL) in seconds.
   */
  async set(key, value, ttlSeconds = 30) {
    if (process.env.REDIS_URL && redisClient.isOpen) {
      try {
        await redisClient.set(key, JSON.stringify(value), {
          EX: ttlSeconds,
        });
        return;
      } catch (err) {
        logger.error(`Redis SET error for key ${key}:`, err);
      }
    }
    // Fallback to in-memory cache
    memoryStore.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000),
    });
  },

  /**
   * Delete a key from cache.
   */
  async del(key) {
    if (process.env.REDIS_URL && redisClient.isOpen) {
      try {
        await redisClient.del(key);
        return;
      } catch (err) {
        logger.error(`Redis DEL error for key ${key}:`, err);
      }
    }
    // Fallback to in-memory cache
    memoryStore.delete(key);
  },

  /**
   * Clear keys matching a pattern (e.g. 'admin:*' or 'vendor:*').
   */
  async clearPattern(pattern) {
    if (process.env.REDIS_URL && redisClient.isOpen) {
      try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
        return;
      } catch (err) {
        logger.error(`Redis clearPattern error for pattern ${pattern}:`, err);
      }
    }
    // Fallback to in-memory cache: match using pattern startsWith logic
    const prefix = pattern.replace('*', '');
    for (const key of memoryStore.keys()) {
      if (key.startsWith(prefix)) {
        memoryStore.delete(key);
      }
    }
  }
};

module.exports = Cache;
