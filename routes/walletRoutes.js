// ================================================
// 🚀 Wallet Routes - FinCore Wallet API
// ================================================

const express = require("express");
const router = express.Router();

// ✅ Controller that handles wallet operations
const walletController = require("../controllers/walletController");

// ✅ Middleware that verifies JWT tokens (protects routes)
const verifyToken = require("../middleware/authMiddleware");

// ---------------------------------------------
// 💰 Deposit Funds into a User's Wallet
// ---------------------------------------------
router.post("/deposit", verifyToken, walletController.depositFunds);

// ---------------------------------------------
// 💸 Withdraw Funds from a User's Wallet
// ---------------------------------------------
router.post("/withdraw", verifyToken, walletController.withdrawFunds);

// ---------------------------------------------
// 📊 Get Current Wallet Balance
// ---------------------------------------------
router.get("/balance", verifyToken, walletController.balance);

// ---------------------------------------------
// 🔄 Transfer Funds to Another User's Wallet
// ---------------------------------------------
router.post("/transfer", verifyToken, walletController.transfer);

// ✅ Export the router to be used in server.js
module.exports = router;
