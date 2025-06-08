// redisClient.js
const { createClient } = require('redis');
require('dotenv').config();

let redisClient;

async function connectRedis() {
  if (redisClient) {
    // Already connected
    return redisClient;
  }

  redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on('error', (err) => console.error('Redis Client Error', err));

  await redisClient.connect();

  console.log('Redis connected successfully');
  return redisClient;
}

module.exports = { connectRedis };
