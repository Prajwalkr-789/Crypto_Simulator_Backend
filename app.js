
const PORT = process.env.PORT || 8080;
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const {connectDB} = require('./Database/database');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const redisDB = require('./Database/RedisDB');
// const helmet = require('helmet');

dotenv.config();
connectDB();

const app = express();

// app.use(helmet({contentSecurityPolicy : false}));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  // origin: "http://localhost:3000",
  origin:"https://crypto-simulator-frontend.vercel.app",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

redisDB.connectRedis()
  .then(() => console.log("✅ Redis connected successfully"))
  .catch((err) => console.error("❌ Redis connection failed:", err));


app.get('/' , (req,res) =>  res.json({message:" Jai shree Ram"}));
app.use("/api", apiRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;




