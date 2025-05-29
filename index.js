// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Import user and wallet models
const User = require("./userModel");
const Wallet = require("./walletModel");
const Transaction = require("./transactionModel");

// Initialize Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

// Load environment variables from .env file
dotenv.config();

// Define constants for server port and JWT secrets
const PORT = process.env.PORT || 1000;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Establish connection to MongoDB database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Database connected...");
    app.listen(PORT, () => {
      console.log(`🚀 Server started on port: ${PORT}`);
    });
  })
  .catch((error) => console.error("❌ Database connection error:", error));

// Middleware to verify JWT authentication
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(403).json({ message: "Unauthorized" });

  jwt.verify(token, ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });

    // Fetch user from the database
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch wallet linked to user
    const wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    // Attach user ID and wallet ID to request object
    req.user = { id: user._id, walletId: wallet._id };

    next();
  });
};

// 📌 Route: User Registration (Creates a user & wallet)
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash the password before storing it securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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
});

// 📌 Route: User Login (Verifies credentials & issues JWT)
app.post("/login", async (req, res) => {
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
});

// 📌 Route: Get Wallet Balance (Requires authentication)
app.get("/wallet/balance", verifyToken, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user.id });

    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    res.status(200).json({ balance: wallet.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 Route: Transfer Money Between Wallets
app.post("/transfer", verifyToken, async (req, res) => {
  try {
    const { receiverWalletId, amount } = req.body;

    if (!receiverWalletId || amount <= 0) {
      return res.status(400).json({ message: "Invalid transaction details" });
    }

    // Fetch sender and receiver wallets
    const senderWallet = await Wallet.findById(req.user.walletId);
    const receiverWallet = await Wallet.findById(receiverWalletId);

    if (!senderWallet || !receiverWallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Check sender balance
    if (senderWallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Create a single transaction entry
    const transaction = new Transaction({
      senderWalletId: senderWallet._id,
      receiverWalletId,
      amount,
    });
    await transaction.save();

    // Update sender and receiver balances
    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    // Link transaction ID to wallets
    senderWallet.transactions.push(transaction._id);
    receiverWallet.transactions.push(transaction._id);

    await senderWallet.save();
    await receiverWallet.save();

    res.status(200).json({ message: "Transaction successful", transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 Route: Get Transaction History (Requires authentication)
app.get("/transactions", verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { senderWalletId: req.user.walletId },
        { receiverWalletId: req.user.walletId },
      ],
    }).sort({ timestamp: -1 });

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
});
