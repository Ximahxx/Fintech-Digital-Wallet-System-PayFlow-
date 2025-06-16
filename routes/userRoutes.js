// ================================================
// 👤 User Routes - Registration, Login & History
// ================================================

const express = require("express");
const router = express.Router();

// ✅ Import Controller & Middleware
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");

// ---------------------------------------------
// 📝 Register a New User (Also creates wallet)
// ---------------------------------------------
router.post("/register", userController.registerUser);

// ---------------------------------------------
// 🔐 Log In Existing User (JWT Auth)
// ---------------------------------------------
router.post("/login", userController.loginUser);

// ---------------------------------------------
// 📜 Get Transaction History (Protected Route)
// ---------------------------------------------
router.get("/transactions", verifyToken, userController.transactions);

// ✅ Export the Router
module.exports = router;
