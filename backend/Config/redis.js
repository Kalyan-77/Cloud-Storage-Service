// const { createClient } = require("redis");

// const redisClient = createClient({
//   url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
// });

// redisClient.on("connect", () => {
//   console.log("✅ Redis Connected");
// });

// redisClient.on("error", (err) => {
//   console.error("❌ Redis Error:", err);
// });

// (async () => {
//   await redisClient.connect();
// })();

// module.exports = redisClient;

const { createClient } = require("redis");

if (!process.env.REDIS_URL) {
  console.warn("⚠️ REDIS_URL not set. Redis disabled.");
}

const redisClient = process.env.REDIS_URL
  ? createClient({
      url: process.env.REDIS_URL,
      socket: {
        tls: true,          // REQUIRED for Upstash
        rejectUnauthorized: false
      }
    })
  : null;

if (redisClient) {
  redisClient.on("connect", () => {
    console.log("✅ Redis Connected");
  });

  redisClient.on("error", (err) => {
    console.error("❌ Redis Error:", err.message);
  });

  (async () => {
    try {
      await redisClient.connect();
    } catch (err) {
      console.error("❌ Redis Connection Failed:", err.message);
    }
  })();
}

module.exports = redisClient;

