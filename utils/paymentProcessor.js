// ===========================================================
// ⏱️ Scheduled Payment Processor - Automates Recurring Payments
// ===========================================================

const cron = require("node-cron");
const ScheduledPayment = require("../models/ScheduledPayment");
const Wallet = require("../models/walletModel");
const User = require("../models/userModel");
const Transaction = require("../models/transactionModel");
const { convertCurrency } = require("./currencyConverter");
const { sendEmail } = require("./emailService");

// 🔄 Cron Job: Runs every minute to check for due payments
cron.schedule("*/1 * * * *", async () => {
  try {
    const now = new Date();
    const duePayments = await ScheduledPayment.find({
      nextPaymentDate: { $lte: now },
    });

    for (const schedule of duePayments) {
      // ✅ Fetch sender and receiver wallet/user details
      const senderWallet = await Wallet.findOne({ userId: schedule.userId });
      const receiverWallet = await Wallet.findById(schedule.receiverWalletId);
      const sender = await User.findById(schedule.userId);
      const receiver = await User.findById(receiverWallet.userId);

      if (
        !senderWallet ||
        !receiverWallet ||
        senderWallet.balance < schedule.amount
      ) {
        continue; // Skip processing if funds are insufficient
      }

      // ✅ Convert amount based on currency exchange rates
      const convertedAmount = convertCurrency(
        schedule.amount,
        senderWallet.currency,
        receiverWallet.currency
      );

      // ✅ Process transaction
      senderWallet.balance -= schedule.amount;
      receiverWallet.balance += convertedAmount;

      const transaction = new Transaction({
        senderWalletId: senderWallet._id,
        receiverWalletId: receiverWallet._id,
        amount: schedule.amount,
      });

      await transaction.save();
      senderWallet.transactions.push(transaction._id);
      receiverWallet.transactions.push(transaction._id);

      await senderWallet.save();
      await receiverWallet.save();

      // ✅ Update next payment date based on frequency
      const next = new Date(schedule.nextPaymentDate);
      if (schedule.frequency === "daily") next.setDate(next.getDate() + 1);
      if (schedule.frequency === "weekly") next.setDate(next.getDate() + 7);
      if (schedule.frequency === "monthly") next.setMonth(next.getMonth() + 1);
      schedule.nextPaymentDate = next;

      await schedule.save();
      console.log(
        `💸 Payment of ₦${schedule.amount} processed for user ${schedule.userId}`
      );

      // ✅ Send Email Notifications
      await sendEmail(
        sender.email,
        "Debit Alert",
        `<h3>You've sent ₦${schedule.amount}</h3><p>To: ${receiver.username}</p>`
      );

      await sendEmail(
        receiver.email,
        "Credit Alert",
        `<h3>You received ₦${schedule.amount}</h3><p>From: ${sender.username}</p>`
      );
    }
  } catch (error) {
    console.error("⛔ Scheduled payment error:", error);
  }
});
