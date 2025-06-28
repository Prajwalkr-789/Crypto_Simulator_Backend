### 🖥️ Backend

#### 📁 Project Structure

```txt
/Controllers → API logic (auth, trades, prices)
/Database → MongoDB connection config
/Models → Mongoose schemas (User, Trade, Transaction)
/Middleware → Auth guard, error handlers
/routes → All route files (auth, trade, price, transactions)
app.js → Main entry file
```

#### 🧪 Setup Instructions

```bash
git clone https://github.com/Prajwalkr-789/Crypto_Simulator_Backend
cd crypto-simulator-backend
npm install
npm run dev
```

```txt
PORT=8080
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-secret
COINGECKO_API_URL=https://api.coingecko.com/api/v3/simple/price
```
