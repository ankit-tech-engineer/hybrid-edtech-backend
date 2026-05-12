const redis = require('../config/redis');
const logger = require('./logger');

const get = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    logger.error(`Cache GET error [${key}]: ${err.message}`);
    return null;
  }
};

const set = async (key, value, ttlSeconds) => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    logger.error(`Cache SET error [${key}]: ${err.message}`);
  }
};

const del = async (key) => {
  try {
    await redis.del(key);
  } catch (err) {
    logger.error(`Cache DEL error [${key}]: ${err.message}`);
  }
};

// Delete all keys matching a pattern (e.g. "tutor_search:*")
const delByPattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch (err) {
    logger.error(`Cache DEL pattern error [${pattern}]: ${err.message}`);
  }
};

module.exports = { get, set, del, delByPattern };
