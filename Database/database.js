const mongoose = require('mongoose')

// const MONGO_URI = process.env.MONGO_URI as string;
const MONGO_URI = "mongodb+srv://prajwalkrp07:vGgNyMqJtXgr7nwU@cluster0.jpkht3e.mongodb.net/Crypto_simulator?retryWrites=true&w=majority&appName=Cluster0"

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Fail:", error);
    process.exit(1);
  }
};
module.exports ={ connectDB }
