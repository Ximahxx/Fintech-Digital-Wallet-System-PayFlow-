// ===============================================
// 🔁 Payment Controller - Manage Scheduled Payments
// ===============================================

const ScheduledPayment = require("../models/ScheduledPayment");

// -----------------------------------------------
// ⏰ Schedule a New Recurring Payment
// -----------------------------------------------
exports.schedulePayment = async (req, res) => {
  try {
    const { receiverWalletId, amount, frequency, startDate } = req.body;

    // Validate required fields
    if (!receiverWalletId || !amount || !frequency || !startDate) {
      return res.status(400).json({ message: "Missing payment fields" });
    }

    // Create and save schedule
    const newSchedule = new ScheduledPayment({
      userId: req.user.id,
      receiverWalletId,
      amount,
      frequency,
      nextPaymentDate: new Date(startDate),
    });

    await newSchedule.save();

    res.status(201).json({
      message: "Payment scheduled",
      schedule: newSchedule,
    });
  } catch (error) {
    console.error("Schedule Payment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------------
// ❌ Cancel a Scheduled Payment by ID
// -----------------------------------------------
exports.cancelScheduledPayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user’s own schedule
    const schedule = await ScheduledPayment.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!schedule) {
      return res.status(404).json({ message: "Scheduled payment not found" });
    }

    // Delete the scheduled payment
    await schedule.deleteOne();

    res.status(200).json({ message: "Scheduled payment canceled" });
  } catch (error) {
    console.error("Cancel Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------------
// 📅 Get All Scheduled Payments for the User
// -----------------------------------------------
exports.getScheduledPayments = async (req, res) => {
  try {
    const schedules = await ScheduledPayment.find({ userId: req.user.id }).sort(
      {
        nextPaymentDate: 1,
      }
    );

    res.status(200).json({
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    console.error("Fetch Schedules Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
