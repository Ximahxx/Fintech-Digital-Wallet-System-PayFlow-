// ==================================================
// 🔐 JWT Authentication Middleware
// ==================================================

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");

// ✅ Load environment variables
dotenv.config();

// --------------------------------------------------
// Middleware: Verifies JWT and attaches user info
// --------------------------------------------------
const verifyToken = async (req, res, next) => {
  // Extract token from Authorization header: "Bearer <token>"
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Unauthorized" });

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find authenticated user
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get user's wallet
    const wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    // Attach user & wallet ID to request for downstream use
    req.user = {
      id: user._id,
      walletId: wallet._id,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;
