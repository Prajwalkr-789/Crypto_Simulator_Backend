
const express = require('express')
const { signup, signin, logout , authenticateToken  } = require('../Controllers/authController')

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
// router.get("/logout", logout);
router.get("/check", authenticateToken);

module.exports = router;
