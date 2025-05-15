const mongoose = require("mongoose");
const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  balance: { type: Number, default: 0 },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
});

const Wallet = new mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
