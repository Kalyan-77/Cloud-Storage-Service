const redisClient = require("../Config/redis");

const redisService = {
  get: async (key) => {
    if (!redisClient) return null;
    try {
      return await redisClient.get(key);
    } catch (err) {
      console.error(`Redis get error for key ${key}:`, err.message);
      return null;
    }
  },

  setEx: async (key, seconds, value) => {
    if (!redisClient) return null;
    try {
      return await redisClient.setEx(key, seconds, value);
    } catch (err) {
      console.error(`Redis setEx error for key ${key}:`, err.message);
      return null;
    }
  },

  del: async (key) => {
    if (!redisClient) return null;
    try {
      return await redisClient.del(key);
    } catch (err) {
      console.error(`Redis del error for key ${key}:`, err.message);
      return null;
    }
  },

  sAdd: async (key, value) => {
    if (!redisClient) return null;
    try {
      return await redisClient.sAdd(key, value);
    } catch (err) {
      console.error(`Redis sAdd error for key ${key}:`, err.message);
      return null;
    }
  },

  sRem: async (key, value) => {
    if (!redisClient) return null;
    try {
      return await redisClient.sRem(key, value);
    } catch (err) {
      console.error(`Redis sRem error for key ${key}:`, err.message);
      return null;
    }
  },

  sMembers: async (key) => {
    if (!redisClient) return [];
    try {
      return await redisClient.sMembers(key);
    } catch (err) {
      console.error(`Redis sMembers error for key ${key}:`, err.message);
      return [];
    }
  },

  incr: async (key) => {
    if (!redisClient) return null;
    try {
      return await redisClient.incr(key);
    } catch (err) {
      console.error(`Redis incr error for key ${key}:`, err.message);
      return null;
    }
  }
};

module.exports = redisService;
