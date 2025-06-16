// ================================================
// 💸 Payment Routes - Schedule & Manage Transfers
// ================================================

const express = require("express");
const router = express.Router();

// ✅ Import Controller & Middleware
const paymentController = require("../controllers/paymentController");
const verifyToken = require("../middleware/authMiddleware");

// ---------------------------------------------
// ⏰ Schedule a Recurring Payment
// ---------------------------------------------
router.post("/schedule", verifyToken, paymentController.schedulePayment);

// ---------------------------------------------
// ❌ Cancel a Scheduled Payment (by ID)
// ---------------------------------------------
router.delete(
  "/schedule/:id",
  verifyToken,
  paymentController.cancelScheduledPayment
);

// ---------------------------------------------
// 📅 Get All Scheduled Payments for the User
// ---------------------------------------------
router.get("/schedule", verifyToken, paymentController.getScheduledPayments);

// ✅ Export Router
module.exports = router;
