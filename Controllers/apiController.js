const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const Transaction = require("../Models/Transaction");
const { connectRedis ,  } = require("../Database/RedisDB");
const {startWorker,stopWorker} = require('../redisCOntroller')
require("dotenv").config();
// authenticateTokenGetID function to get user ID from token
// buycoin function to handle coin purchase
// sellcoin function to handle coin sale
// getTransactionHistory function to fetch user's transaction history
// getHoldings function to fetch user's coin holdings
// Dashboard function to fetch user's wallet balance and transactions
// getWalletBalance function to fetch user's wallet balance

let clients = [];
let cachedData = null;

const JWT_SECRET = process.env.JWT_SECRET;

async function buycoin(req, res) {
  try {
    const { coinName, quantity, pricePerCoin } = req.body;
    console.log("before authenticating");
    const UserId = req.user;
    if (!UserId || UserId === null) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log("after taking the id");
    const user = await User.findById(UserId);
    console.log("after authenticating");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("user found");
    if (user.walletBalance < quantity * pricePerCoin) {
      return res.status(400).json({ message: "Insufficient funds" });
    }
    console.log("user found and funds are sufficient");
    user.walletBalance -= quantity * pricePerCoin;
    const existingHolding = user.holdings.find(h => h.coinName === coinName);

if (existingHolding) {
  existingHolding.quantity += quantity;
  existingHolding.purchasePrice = pricePerCoin;
  existingHolding.purchaseDate = new Date();
} else {
  user.holdings.push({
    coinName,
    quantity,
    purchasePrice: pricePerCoin,
    purchaseDate: new Date(),
  });
}
    
    await user.save();
    

    console.log("holdings saved");
    const transaction = new Transaction({
      user: user._id,
      coinName,
      transactionType: "buy",
      quantity,
      pricePerCoin,
      totalAmount: quantity * pricePerCoin,
      commissionFee: 0,
      purchaseDate: new Date(),
    });
    await transaction.save();
    console.log("transaction saved");

    console.log("user saved");
    res
      .status(200)
      .json({
        message: "Coin purchased successfully",
        walletBalance: user.walletBalance,
      });
  } catch (error) {
    console.error("Error in buycoin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function sellcoin(req, res) {
  try {
  const { coinName, quantity, pricePerCoin } = req.body;
  const UserId = req.user;
  if (!UserId || UserId === null) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(UserId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const holding = user.holdings.find(h => h.coinName === coinName);
    if (!holding || holding.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient holdings" });
    }

    user.walletBalance += quantity * pricePerCoin;

    holding.quantity -= quantity;
    holding.purchaseDate = new Date();

    if (holding.quantity === 0) {
      const holdingIndex = user.holdings.findIndex(h => h.coinName === coinName);
      if (holdingIndex !== -1) {
        user.holdings.splice(holdingIndex, 1);
      }
    }

    await user.save();
  
  const value = quantity * pricePerCoin;

  const transaction = new Transaction({
    user: user._id,
    coinName,
    transactionType: "sell",
    quantity,
    pricePerCoin,
    totalAmount: pricePerCoin * quantity,
    commissionFee: 0,
    purchaseDate: new Date(),
  });
  await transaction.save();
  // await user.save();
  res
    .status(200)
    .json({
      message: "Coin sold successfully",
      walletBalance: user.walletBalance,
    });
  }
  catch (error) {
    console.error("Error in sellcoin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getTransactionHistory(req, res) {
  try {
  const UserId = req.user;
  if (!UserId || UserId === null) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(UserId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const transactions = await Transaction.find({ user: user._id }).sort({
    purchaseDate: -1,
  });
  res.status(200).json(transactions);
} catch (error) {
  console.error("Error fetching transaction history:", error);
  res.status(500).json({ error: "Internal server error" });
}
}

async function getHoldings(req, res) {
  try {
    const UserId = req.user;
    if (!UserId || UserId === null) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById(UserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const holdings = await user.holdings
    res.status(200).json(holdings);
  } catch (error) {
    console.error("Error fetching holdings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function Dashboard(req, res) {
  try{
  const UserId = req.user;
  if (!UserId || UserId === null) {
    console.log("UserId" + UserId);
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(UserId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  console.log("user found in dashboard");
  const walletBalance = await user.walletBalance;
  const holdings = await user.holdings;
  const transactions = await Transaction.find({ user: user._id }).limit(6).sort({
    purchaseDate: -1,
  });
  const username = user.username;

  return res.status(200).json({username, walletBalance,holdings, transactions });
}
  catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getWalletBalance(req, res) {
  try {
    const UserId = req.user;
    if (!UserId || UserId === null) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById(UserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ walletBalance: user.walletBalance });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}


// Function to fetch data from CoinGecko and broadcast to all clients
  // const fetchAndBroadcastPrices = async () => {
  //   // console.log("Fetching prices from CoinGecko called here");
  //   console.log("Fetching prices from CoinGecko...");
  //   try {
  //     const response = await fetch(
  //       'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=24&page=1'
  //     );
  //     const data = await response.json();
  //     cachedData = data;

  //     // Send data to all connected clients
  //     clients.forEach(client => {
  //       client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  //     });
  //   } catch (error) {
  //     const errorMsg = { error: 'Failed to fetch prices' };
  //     clients.forEach(client => {
  //       client.res.write(`data: ${JSON.stringify(errorMsg)}\n\n`);
  //     });
  //   }
  // };

  // Set up interval to fetch every 20 seconds
  // if (!globalThis.priceFetchIntervalSet) {
  //   globalThis.priceFetchIntervalSet = true;
  //   setInterval(fetchAndBroadcastPrices, 20000); 
  // }

  // SSE handler
  async function serversentevent(req, res) {
    // Set headers for SSE
    console.log("SSE request received");
    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // res.flushHeaders();

    console.log("SSE connection established");

    // Push the latest cached data immediately
     const redis = await connectRedis();

  // Send latest cached data from Redis
  const cached = await redis.get('crypto_prices');
  if (cached) {
    res.write(`data: ${cached}\n\n`);
  }

    const clientId = Date.now();
    const newClient = {
      id: clientId,
      res
    };
    
    clients.push(newClient);
    console.log(`Client ${clientId} connected. Total clients: ${clients.length}`);
  if(clients.length == 1){
        startWorker();
      }
    const sub = redis.duplicate();
    await sub.connect();
    await sub.subscribe('price_update', async () => {
    const newData = await redis.get('crypto_prices');
    if (newData) {
      clients.forEach(c => {
        c.res.write(`data: ${newData}\n\n`);
      });
    }
  });

   const disconnectTimer = setTimeout(async () => {
    console.log(`Client ${clientId} auto-disconnected after 2.5 min`);
    if(clients.length == 0){
        stopWorker();
      }
    res.end();
  }, 150000);

    // Clean up when client disconnects
    req.on('close', async () => {
      console.log(`Client ${clientId} disconnected`);
      clients = clients.filter(c => c.id !== clientId);
      if(clients.length == 0) {
        stopWorker();
      }
      await sub.unsubscribe('price_update');
      await sub.quit();
      res.end();
    });
  }


module.exports = {
  getWalletBalance,
  buycoin,
  sellcoin,
  getTransactionHistory,
  Dashboard,
  getHoldings,
  serversentevent,
};
