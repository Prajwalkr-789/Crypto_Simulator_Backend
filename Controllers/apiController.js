const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const Transaction = require("../Models/Transaction");


// authenticateTokenGetID function to get user ID from token
// buycoin function to handle coin purchase
// sellcoin function to handle coin sale
// getTransactionHistory function to fetch user's transaction history
// getHoldings function to fetch user's coin holdings
// Dashboard function to fetch user's wallet balance and transactions
// getWalletBalance function to fetch user's wallet balance

const JWT_SECRET = "Prajwal<3sahana";

function authenticateTokenGetID(req, res) {
  try {
  const token = req.cookies?.jwt;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return decoded.userId;
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
} catch (error) {
  console.error("Error in authenticateTokenGetID:", error);
  return res.status(500).json({ message: "Token not found" });
}
}

async function buycoin(req, res) {
  try {
    const { coinName, quantity, pricePerCoin } = req.body;
    console.log("before authenticating");
    const UserId = await authenticateTokenGetID(req, res);
    if (!UserId) {
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

    if (user.holdings[coinName]) {
      user.holdings[coinName].quantity += quantity;
      user.holdings[coinName].purchasePrice = pricePerCoin;
      user.holdings[coinName].purchaseDate = new Date();
    } else {
      user.holdings[coinName] = {
        quantity,
        purchasePrice: pricePerCoin,
        purchaseDate: new Date(),
      };
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
  const UserId = await authenticateTokenGetID(req, res);
  if (!UserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(UserId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // const holdingIndex = user.holdings.findIndex(h => h.coinName === coinName);
  //   if (holdingIndex === -1 || user.holdings[holdingIndex].quantity < quantity) {
  //     return res.status(400).json({ message: "Insufficient holdings" });
  //   }

  //   // Update wallet balance
  //   const value = pricePerCoin * quantity;
  //   user.walletBalance += value;

  //   // Update or remove holding
  //   user.holdings[holdingIndex].quantity -= quantity;
  //   if (user.holdings[holdingIndex].quantity === 0) {
  //     user.holdings.splice(holdingIndex, 1);
  //   }

  //   await user.save();

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
  const UserId = await authenticateTokenGetID(req, res);
  if (!UserId) {
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
    const UserId = await authenticateTokenGetID(req, res);
    if (!UserId) {
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
  const UserId = await authenticateTokenGetID(req, res);
  if (!UserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(UserId.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const walletBalance = user.walletBalance;
  const holdings = await user.holdings;
  const transactions = await Transaction.find({ user: user._id });

  return res.status(200).json({ walletBalance, transactions });
}

async function getWalletBalance(req, res) {
  try {
    const UserId = await authenticateTokenGetID(req, res);
    if (!UserId) {
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



module.exports = {
  getWalletBalance,
  buycoin,
  sellcoin,
  getTransactionHistory,
  Dashboard,
  getHoldings
};
