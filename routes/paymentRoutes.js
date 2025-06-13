const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const verifyToken = require("../middleware/authMiddleware");

router.post("/schedule", verifyToken, paymentController.schedulePayment);

router.delete(
  "/schedule/:id",
  verifyToken,
  paymentController.cancelScheduledPayment
);

router.get("/schedule", verifyToken, paymentController.getScheduledPayments);

module.exports = router;
