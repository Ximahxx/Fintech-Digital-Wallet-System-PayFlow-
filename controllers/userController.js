// Import required modules
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Import user and wallet models
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const Transaction = require("../models/transactionModel");

// Load environment variables from .env file
dotenv.config();

// Define constants for JWT secrets
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// 📌 Route: User Registration (Creates a user & wallet)
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user and save to database
    const newUser = new User({ username, email, passwordHash: hashedPassword });
    await newUser.save();

    // Auto-create wallet for the new user
    const newWallet = new Wallet({ userId: newUser._id, balance: 0 });
    await newWallet.save();

    // Link wallet ID to the user
    newUser.walletId = newWallet._id;
    await newUser.save();

    // Generate JWT token for authentication
    const token = jwt.sign({ id: newUser._id }, ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Route: User Login (Verifies credentials & issues JWT)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in the database
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User account does not exist." });

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate authentication tokens
    const accessToken = jwt.sign({ id: user._id }, ACCESS_TOKEN_SECRET, {
      expiresIn: "5m",
    });
    const refreshToken = jwt.sign({ id: user._id }, REFRESH_TOKEN_SECRET, {
      expiresIn: "30d",
    });

    // Remove password hash before returning user details
    const { passwordHash, ...userData } = user.toObject();

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: userData,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Route: Get Transaction History (Requires authentication)
exports.transactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { senderWalletId: req.user.walletId },
        { receiverWalletId: req.user.walletId },
      ],
    }).sort({ timestamp: -1 }); // Sorting transactions from newest to oldest

    // Format transactions dynamically
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
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
