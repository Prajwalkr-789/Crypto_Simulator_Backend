const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const Transaction = require("../Models/Transaction");

// signup function to register a new user
// signin function to authenticate a user
// authenticateToken function to verify JWT token
//logout function to clear the JWT token from cookies
// JWT_SECRET is used to sign the JWT token

const JWT_SECRET = "Prajwal<3sahana";

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        const errors = {};
      
        if (!username) errors.username = "Username is required";
        if (!email) errors.email = "Email is required";
        if (!password) errors.password = "Password is required";
      
        return res.status(400).json({ errors });
      }
      
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("jwt", token, {
       httpOnly: true,
       secure: true,
       maxAge: 3600000, // 1 hour
    });

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
        const errors = {};
        if(!email) errors.email = "Email is required";
        if(!password) errors.password = "Password is required";

      return res
        .status(400)
        .json({errors});
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Email does not exist" });
    }

    if (!user.password) {
      return res
        .status(401)
        .json({ error: "Password not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: " Password is wrong " });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

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
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return res
      .status(200)
      .json({ message: "Token is valid", userId: decoded.userId });
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
}

const logout = async (req, res) => {
  if(!req.cookies?.jwt) {
    return res.status(401).json({ message: "No token provided" });
  }
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully" });
  };


module.exports = {
  signup,
  signin,
  authenticateToken,
  logout
};