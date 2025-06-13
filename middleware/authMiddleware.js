const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const dotenv = require("dotenv");

dotenv.config();

// Middleware to verify JWT authentication
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Fetch user from the database
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch wallet linked to user
    const wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    // Attach user ID and wallet ID to request object
    req.user = { id: user._id, walletId: wallet._id };

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;
