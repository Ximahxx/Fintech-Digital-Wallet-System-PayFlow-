const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  senderWalletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
  receiverWalletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["transfer"], default: "transfer" },
  timestamp: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
