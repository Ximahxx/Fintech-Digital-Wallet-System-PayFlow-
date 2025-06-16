// ===============================================
// 👤 User Controller - Registration, Login & Transactions
// ===============================================

// ✅ Required Modules
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ✅ Load Models
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const Transaction = require("../models/transactionModel");

// ✅ Load Environment Variables
dotenv.config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// -----------------------------------------------
// 📝 Register User - Creates a User & Wallet
// -----------------------------------------------
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User exists" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      passwordHash: hashedPassword,
    });
    await newUser.save();

    // Create wallet and link to user
    const newWallet = new Wallet({ userId: newUser._id, balance: 0 });
    await newWallet.save();
    newUser.walletId = newWallet._id;
    await newUser.save();

    // Generate access token
    const token = jwt.sign({ id: newUser._id }, ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------------
// 🔐 Login User - Authenticates & Issues Tokens
// -----------------------------------------------
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User account does not exist." });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT tokens
    const accessToken = jwt.sign({ id: user._id }, ACCESS_TOKEN_SECRET, {
      expiresIn: "5m",
    });
    const refreshToken = jwt.sign({ id: user._id }, REFRESH_TOKEN_SECRET, {
      expiresIn: "30d",
    });

    // Exclude password hash from response
    const { passwordHash, ...userData } = user.toObject();

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: userData,
      refreshToken,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------------
// 📜 Get Transaction History - Authenticated Route
// -----------------------------------------------
exports.transactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { senderWalletId: req.user.walletId },
        { receiverWalletId: req.user.walletId },
      ],
    }).sort({ timestamp: -1 });

    // Format transactions with readable info
    const formattedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const sender = await User.findOne({
          walletId: transaction.senderWalletId,
        });
        const receiver = await User.findOne({
          walletId: transaction.receiverWalletId,
        });

        return {
          _id: transaction._id,
          amount: transaction.amount,
          type:
            transaction.senderWalletId.toString() ===
            req.user.walletId.toString()
              ? "debit"
              : "credit",
          otherParty:
            transaction.senderWalletId.toString() ===
            req.user.walletId.toString()
              ? receiver?.username || "Unknown Recipient"
              : sender?.username || "Unknown Sender",
          timestamp: transaction.timestamp,
        };
      })
    );

    res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error("Transaction Fetch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
