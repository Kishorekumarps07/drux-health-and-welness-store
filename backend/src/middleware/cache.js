const { redisClient } = require('../config/redis');
const logger = require('../config/logger');

// Middleware to check if response is cached
const cacheResponse = (durationInSeconds) => {
  return async (req, res, next) => {
    // Determine a unique cache key based on the URL and query strings
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      // Check if Redis is connected
      if (!redisClient.isReady) {
        return next();
      }

      // Check cache
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cachedData));
      }

      // If not in cache, override res.json to catch the outgoing response
      res.setHeader('X-Cache', 'MISS');
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Only cache successful JSON responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.setEx(key, durationInSeconds, JSON.stringify(body)).catch((err) => {
            logger.error('Redis cache setting error', err);
          });
        }
        originalJson(body);
      };
      
      next();
    } catch (error) {
      logger.error('Redis cache middleware error', error);
      next(); // Fail gracefully
    }
  };
};

// Utility to clear cache by pattern
const clearCacheKeys = async (pattern) => {
  if (!redisClient.isReady) return;
  try {
    const keys = await redisClient.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    logger.error('Failed to clear cache', error);
  }
};

module.exports = {
  cacheResponse,
  clearCacheKeys,
};
