const mongoose = require("mongoose");

const scheduledPaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverWalletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },
  amount: { type: Number, required: true },
  frequency: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
    required: true,
  },
  nextPaymentDate: { type: Date, required: true },
});

module.exports = mongoose.model("ScheduledPayment", scheduledPaymentSchema);
