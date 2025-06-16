// ============================================
// 💼 Wallet Controller - Deposit, Withdraw, Transfer, Balance
// ============================================

// ✅ Import Utilities
const { convertCurrency } = require("../utils/currencyConverter");
const { sendEmail } = require("../utils/emailService");

// ✅ Import Models
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const Transaction = require("../models/transactionModel");

// --------------------------------------------
// 📊 Get Wallet Balance
// --------------------------------------------
exports.balance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    res.status(200).json({ balance: wallet.balance });
  } catch (error) {
    console.error("Balance Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------
// 🔄 Transfer Funds Between Wallets
// --------------------------------------------
exports.transfer = async (req, res) => {
  try {
    const { receiverWalletId, amount } = req.body;

    // ✅ Validate input
    if (!receiverWalletId || amount <= 0) {
      return res.status(400).json({ message: "Invalid transaction details" });
    }

    // ✅ Fetch wallets and users
    const senderWallet = await Wallet.findById(req.user.walletId);
    const receiverWallet = await Wallet.findById(receiverWalletId);
    const sender = await User.findById(req.user.id);
    const receiver = await User.findById(receiverWallet?.userId);

    if (!senderWallet || !receiverWallet || !sender || !receiver) {
      return res.status(404).json({ message: "Wallet or user not found" });
    }

    if (senderWallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // ✅ Handle currency conversion
    const convertedAmount = convertCurrency(
      amount,
      senderWallet.currency,
      receiverWallet.currency
    );

    // ✅ Create and save transaction
    const transaction = new Transaction({
      senderWalletId: senderWallet._id,
      receiverWalletId,
      amount,
    });
    await transaction.save();

    // ✅ Update balances and link transactions
    senderWallet.balance -= amount;
    receiverWallet.balance += convertedAmount;
    senderWallet.transactions.push(transaction._id);
    receiverWallet.transactions.push(transaction._id);

    await senderWallet.save();
    await receiverWallet.save();

    // ✅ Send Email Notifications
    await sendEmail(
      sender.email,
      "Debit Alert",
      `<h3>You've sent ₦${amount}</h3><p>To: ${receiver.username}</p>`
    );

    await sendEmail(
      receiver.email,
      "Credit Alert",
      `<h3>You received ₦${amount}</h3><p>From: ${sender.username}</p>`
    );

    res.status(200).json({
      message: "Transaction successful",
      transaction,
    });
  } catch (error) {
    console.error("Transfer Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------
// 💰 Deposit Funds into Wallet
// --------------------------------------------
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

    res.status(200).json({
      message: "Deposit successful",
      balance: wallet.balance,
    });
  } catch (error) {
    console.error("Deposit Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------
// 💸 Withdraw Funds from Wallet
// --------------------------------------------
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

    res.status(200).json({
      message: "Withdrawal successful",
      balance: wallet.balance,
    });
  } catch (error) {
    console.error("Withdraw Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
