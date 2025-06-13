const { convertCurrency } = require("../utils/currencyConverter");
const { sendEmail } = require("../utils/emailService");

// Import user and wallet models
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const Transaction = require("../models/transactionModel");

// 📌 Route: Get Wallet Balance (Requires authentication)
exports.balance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user.id });

    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    res.status(200).json({ balance: wallet.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Route: Transfer Money Between Wallets
exports.transfer = async (req, res) => {
  try {
    const { receiverWalletId, amount } = req.body;

    // Fetch sender and receiver wallets
    const senderWallet = await Wallet.findById(req.user.walletId);
    const receiverWallet = await Wallet.findById(receiverWalletId);
    const sender = await User.findById(req.user.id);
    const receiver = await User.findById(receiverWallet.userId);

    if (!receiverWalletId || amount <= 0) {
      return res.status(400).json({ message: "Invalid transaction details" });
    }

    if (!senderWallet || !receiverWallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Check sender balance
    if (senderWallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const convertedAmount = convertCurrency(
      amount,
      senderWallet.currency,
      receiverWallet.currency
    );

    // Create a single transaction entry
    const transaction = new Transaction({
      senderWalletId: senderWallet._id,
      receiverWalletId,
      amount,
    });
    await transaction.save();

    // Update sender and receiver balances
    senderWallet.balance -= amount;
    receiverWallet.balance += convertedAmount;

    // Link transaction ID to wallets
    senderWallet.transactions.push(transaction._id);
    receiverWallet.transactions.push(transaction._id);

    await senderWallet.save();
    await receiverWallet.save();
    console.log(sender.email);
    console.log(receiver.email);

    await sendEmail(
      sender.email,
      "Debit Alert",
      `
      <h3>You've sent ₦${amount}</h3>
      <p>To: ${receiver.username}</p>
      `
    );

    await sendEmail(
      receiver.email,
      "Credit Alert",
      `
      <h3>You received ₦${amount}</h3>
      <p>From: ${sender.username}</p>
      `
    );

    res.status(200).json({ message: "Transaction successful", transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.depositFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid deposit amount" });
    }

    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    wallet.balance += amount;
    await wallet.save();

    res
      .status(200)
      .json({ message: "Deposit successful", balance: wallet.balance });
  } catch (error) {
    console.error("Deposit Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.withdrawFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid withdrawal amount" });
    }

    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    wallet.balance -= amount;
    await wallet.save();

    res
      .status(200)
      .json({ message: "Withdrawal successful", balance: wallet.balance });
  } catch (error) {
    console.error("Withdraw Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
