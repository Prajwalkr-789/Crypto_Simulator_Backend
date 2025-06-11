const express = require('express')
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getWalletBalance, buycoin, sellcoin, serversentevent, getTransactionHistory, Dashboard, getHoldings } = require('../Controllers/apiController')

router.get("/walletbalance", authMiddleware , getWalletBalance);
router.post("/buy",authMiddleware , buycoin);
router.post("/sell",authMiddleware , sellcoin);
router.get("/gettrnhst",authMiddleware , getTransactionHistory);
router.get("/gethld",authMiddleware , getHoldings);
router.get("/price", serversentevent);
router.get("/dash",authMiddleware , Dashboard);

module.exports = router;