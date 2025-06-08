// priceWorker.js
// const fetch = require('node-fetch'); 
const { connectRedis } = require('./Database/RedisDB');

async function fetchAndPublishPrices() {
  const redis = await connectRedis();

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=24&page=1'
    );
    const data = await response.json();

    // Save the fetched data to Redis
    await redis.set('crypto_prices', JSON.stringify(data), {
      EX: 30, // expire in 30 seconds
    });

    // Publish a message to notify subscribers
    await redis.publish('price_update', 'updated');

    console.log('Fetched and stored prices in Redis');
  } catch (err) {
    console.error('Error fetching prices or writing to Redis:', err);
  }
}

// Call every 20 seconds
async function startWorker() {
  await fetchAndPublishPrices(); // initial call
  setInterval(fetchAndPublishPrices, 20000); // every 20 seconds
}

startWorker();
