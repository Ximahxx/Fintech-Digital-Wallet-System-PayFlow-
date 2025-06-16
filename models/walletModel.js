// ================================================
// 💼 Wallet Model - User Wallet Schema
// ================================================

const mongoose = require("mongoose");

// ✅ Define Wallet Schema
const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
  ],
  currency: {
    type: String,
    enum: ["NGN", "USD", "EUR"],
    default: "NGN",
  },
});

// ✅ Create Wallet Model
const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
