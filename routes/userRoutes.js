// Import required modules
const express = require("express");
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

// 📌 Route: User Registration (Creates a user & wallet)
router.post("/register", userController.registerUser);
// 📌 Route: User Login (Verifies credentials & issues JWT)
router.post("/login", userController.loginUser);
// 📌 Route: Get Transaction History (Requires authentication)
router.get("/transactions", verifyToken, userController.transactions);

module.exports = router;
