
const express = require('express')
const { signup, signin, logout , authenticateToken , getWalletBalance , buycoin , sellcoin , getTransactionHistory , getHoldings , Dashboard } = require('../Controllers/controller')

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout", logout);
router.get("/auth", authenticateToken);
router.post("/WalletBalance", getWalletBalance);
router.post("/buy", buycoin);
router.post("/sell", sellcoin);
router.get("/gettrnhst", getTransactionHistory);
router.get("/gethld", getHoldings);

// router.post("/logout", logout);
// router.post("/logout", logout);

module.exports = router;
