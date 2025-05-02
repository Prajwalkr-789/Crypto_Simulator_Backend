
const PORT = process.env.PORT || 8080;
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const {connectDB} = require('./Database/database');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const helmet = require('helmet');

dotenv.config();
connectDB();

const app = express();

app.use(helmet({contentSecurityPolicy : false}));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use("/api", apiRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

 module.exports = app;


//  