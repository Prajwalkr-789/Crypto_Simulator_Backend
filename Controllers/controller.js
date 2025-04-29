const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../Models/User')
const Holdings = require('../Models/Holdings')
const Transaction = require('../Models/Transaction')

const JWT_SECRET = "Prajwal<3sahana";

 const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "1h" });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1 hour
    });

    res.json({ message: "Signup successful" });
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(401).json({ error: "Invalid credentials(Password not found)" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1 hour
    });

    res.json({ message: "Login successful" });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

function authenticateToken(req, res) {
  const token = req.cookies?.jwt;
  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return res.status(200).json({ message: 'Token is valid', userId: decoded.userId });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

function authenticateTokenGetID(req, res) {
  const token = req.cookies?.jwt;
  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
   return decoded.userId;
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

async function buycoin (req , res) {
  const { coinName, quantity, pricePerCoin } = req.body;
  console.log("before authenticating")
  const UserId = await authenticateTokenGetID(req , res);
  if (!UserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  console.log("after taking the id")
  const user = await User.findById(UserId);
  console.log("after authenticating")
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  console.log("user found")
  if (user.walletBalance < quantity * pricePerCoin) {
    return res.status(400).json({ message: "Insufficient funds" });
  }
  console.log("user found and funds are sufficient")
  user.walletBalance -= quantity * pricePerCoin;
  const holdings = new Holdings({
    user: user._id,
    coinName,
    quantity,
    purchasePrice: pricePerCoin,
    purchaseDate: new Date(),
  });
  
  
  await holdings.save();
  console.log("holdings saved")
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
  console.log("transaction saved")
  await user.save();
  console.log("user saved")
  res.status(200).json({ message: "Coin purchased successfully", walletBalance: user.walletBalance });
}

async function sellcoin (req , res) {
  const { coinName, quantity, pricePerCoin } = req.body;
  const UserId = await authenticateTokenGetID(req , res);
  if (!UserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(UserId.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const holdings = await Holdings.findOne({ user: user._id, coinName });
  if (!holdings || holdings.quantity < quantity) {
    return res.status(400).json({ message: "Insufficient holdings" });
  }
  user.walletBalance += quantity * pricePerCoin;
  holdings.quantity -= quantity;
  if (holdings.quantity === 0) {
    await holdings.remove();
  } else {
    await holdings.save();
  }
  const value = quantity * pricePerCoin;
  const transaction = new Transaction({
    user: user._id,
    coinName,
    transactionType: "sell",
    quantity,
    pricePerCoin,
    totalAmount: 100,
    commissionFee: 0, 
    purchaseDate: new Date(),
  });
  await transaction.save();
  await user.save();
  res.status(200).json({ message: "Coin sold successfully", walletBalance: user.walletBalance });
}

async function getTransactionHistory (req , res) {
  const UserId = await authenticateTokenGetID(req , res);
  if (!UserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(UserId.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const transactions = await Transaction.find({ user: user._id }).sort({ purchaseDate: -1 });
  res.status(200).json(transactions);
}

async function getHoldings (req , res) {
  const UserId = await authenticateTokenGetID(req , res);
  if (!UserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(UserId.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const holdings = await Holdings.find({ user: user._id }).sort({ purchaseDate: -1 });
  res.status(200).json(holdings);
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
  const holdings = await Holdings.find({ user: user._id });
  const transactions = await Transaction.find({ user: user._id });

  return res.status(200).json({walletBalance, holdings, transactions});
}

// List of functions to continue according to frontend:

// 4. getUserDetails - Fetch the user's details (username, email, etc.) - dont need yet so paused.




async function getWalletBalance (req , res) {
  try{

    const UserId = await authenticateTokenGetID(req , res);
    if (!UserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById(UserId.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ walletBalance: user.walletBalance });
  }
  catch (error) {
    console.error("Error fetching wallet balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

const logout = async (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {signin , signup , logout, authenticateToken , getWalletBalance, buycoin , sellcoin , getTransactionHistory , getHoldings , Dashboard}