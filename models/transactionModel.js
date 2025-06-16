// ===============================================
// 🔄 Transaction Model - Wallet Transfers Only
// ===============================================

const mongoose = require("mongoose");

// ✅ Define Transaction Schema
const transactionSchema = new mongoose.Schema({
  senderWalletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
  },
  receiverWalletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["transfer"],
    default: "transfer",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Create and Export Model
const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
