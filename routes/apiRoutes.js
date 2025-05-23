const express = require('express')
const router = express.Router();

const { getWalletBalance, buycoin, sellcoin, serversentevent, getTransactionHistory, getHoldings } = require('../Controllers/apiController')

router.get("/walletbalance", getWalletBalance);
router.post("/buy", buycoin);
router.post("/sell", sellcoin);
router.get("/gettrnhst", getTransactionHistory);
router.get("/gethld", getHoldings);
router.get("/price", serversentevent);

module.exports = router;