const express = require('express')
const router = express.Router();

const { getWalletBalance, buycoin, sellcoin, getTransactionHistory, getHoldings } = require('../Controllers/apiController')

router.get("/WalletBalance", getWalletBalance);
router.post("/buy", buycoin);
router.post("/sell", sellcoin);
router.get("/gettrnhst", getTransactionHistory);
router.get("/gethld", getHoldings);

module.exports = router;