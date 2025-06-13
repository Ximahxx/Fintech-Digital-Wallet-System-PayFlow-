const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const verifyToken = require("../middleware/authMiddleware");

// 📌 Route: Make Deposit (Requires authentication)
router.post("/deposit", verifyToken, walletController.depositFunds);

// 📌 Route: Withdraw Money (Requires authentication)
router.post("/withdraw", verifyToken, walletController.withdrawFunds);

// 📌 Route: Get Wallet Balance (Requires authentication)
router.get("/balance", verifyToken, walletController.balance);

// 📌 Route: Transfer Money Between Wallets
router.post("/transfer", verifyToken, walletController.transfer);

module.exports = router;
