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

// Load environment variables
dotenv.config();

// Define constants
const PORT = process.env.PORT || 1000;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

// Establish connection to MongoDB database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database connected...");
    app.listen(PORT, () => {
      console.log(`Server started on port: ${PORT}`);
    });
  })
  .catch((error) => console.error("Database connection error:", error));

// Route to create a new user
app.post("/create-user", async (req, res) => {
  const { username, email, password } = req.body;

  // Check if the user already exists
  let existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash the password before storing
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user and save to database
  const newUser = new User({ username, email, passwordHash: hashedPassword });
  await newUser.save();

  // Create a wallet for the new user
  const newWallet = new Wallet({ userId: newUser._id });
  await newWallet.save();

  // Link wallet ID to the user
  newUser.walletId = newWallet._id;
  await newUser.save();

  // Send success response with user details
  res.status(201).json({
    message: "User created successfully",
    newUser,
  });
});

// Route to log in an existing user
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Find user in the database
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User account does not exist." });
  }

  // Compare provided password with stored hashed password
  const result = await bcrypt.compare(password, user.passwordHash);
  if (!result) {
    return res.status(400).json({ message: "Username or password incorrect" });
  }

  // Generate authentication tokens
  const accessToken = jwt.sign({ id: user._id }, ACCESS_TOKEN, {
    expiresIn: "5m",
  });

  const refreshToken = jwt.sign({ id: user._id }, REFRESH_TOKEN, {
    expiresIn: "30d",
  });

  // Extract all user properties except 'passwordHash' to ensure sensitive data is not exposed when sending the user object in the response.
  const { passwordHash, ...userData } = user.toObject();

  // Find user wallet in the database
  const wallet = user.walletId ? await Wallet.findById(user.walletId) : null;
  const walletData = wallet ? wallet.toObject() : null;

  // Send success response with tokens and user details
  res.status(200).json({
    message: "You have successfully logged in",
    accessToken,
    user: userData,
    wallet: walletData,
    refreshToken,
  });
});

// Route to transfer money
app.post("/transfer", async (req, res) => {
  try {
    const { senderWalletId, receiverWalletId, amount } = req.body;

    if (!senderWalletId || !receiverWalletId || amount <= 0) {
      return res.status(400).json({ message: "Invalid transaction details" });
    }

    // Fetch sender and receiver wallets
    const senderWallet = await Wallet.findById(senderWalletId);
    const receiverWallet = await Wallet.findById(receiverWalletId);

    if (!senderWallet || !receiverWallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Check sender balance
    if (senderWallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct from sender and credit receiver
    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    await senderWallet.save();
    await receiverWallet.save();

    // Log the transaction
    const transaction = new Transaction({
      senderWalletId,
      receiverWalletId,
      amount,
    });
    await transaction.save();

    res.status(200).json({ message: "Transaction successful", transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
