const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const Transaction = require("../Models/Transaction");
const { path } = require("../app");
require("dotenv").config();
// signup function to register a new user
// signin function to authenticate a user
// authenticateToken function to verify JWT token
//logout function to clear the JWT token from cookies
// JWT_SECRET is used to sign the JWT token

const JWT_SECRET = process.env.JWT_SECRET;

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
    const token = await jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // res.cookie("jwt", token, {
    //    httpOnly: true,
    //    secure: process.env.NODE_ENV === "production",
    //    sameSite: 'none',
    //    maxAge: 3600000,
    // });

    res.status(201).json({ message: "User created successfully" , token : token , username : newUser.username });
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

    const token = await jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // res.cookie("jwt", token, {
    //   httpOnly: true,
    //   secure: true, 
    //   maxAge: 1 * 60 * 60 * 1000, 
    //   sameSite: 'None',
    //   path: '/'
    // });

    res.status(200).json({ message: "Login successful",token : token  , username : user.username  });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

async function authenticateToken(req, res) {
  const authHeader = req.headers?.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access Denied. Invalid token format." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Invalid token." });
    }

    const user = await User.findById(decoded.userId).select("username");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ message: "Token is valid", username: user.username });
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
}

// const logout = async (req, res) => {
//   if(!req.cookies?.jwt) {
//     return res.status(401).json({ message: "No token provided" });
//   }
//     res.clearCookie("jwt");
//     res.status(200).json({ message: "Logged out successfully" });
//   };


module.exports = {
  signup,
  signin,
  authenticateToken,
};