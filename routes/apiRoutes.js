const express = require('express')
const router = express.Router();

const { getWalletBalance, buycoin, sellcoin, serversentevent, getTransactionHistory, Dashboard, getHoldings } = require('../Controllers/apiController')

router.get("/walletbalance", getWalletBalance);
router.post("/buy", buycoin);
router.post("/sell", sellcoin);
router.get("/gettrnhst", getTransactionHistory);
router.get("/gethld", getHoldings);
router.get("/price", serversentevent);
router.get("/dash", Dashboard);

module.exports = router;