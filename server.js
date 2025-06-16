// ✅ Import Core Modules
const express = require("express");
const dotenv = require("dotenv");

// ✅ Load Environment Variables from .env file
dotenv.config();

// ✅ Connect to MongoDB
const connectDB = require("./config/db");

// ✅ Import Route Handlers
const userRoutes = require("./routes/userRoutes");
const walletRoutes = require("./routes/walletRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// ✅ Load Background Job for Scheduled Payments
require("./utils/paymentProcessor");

// ✅ Initialize Express App
const app = express();

// ✅ Middleware: Parse JSON bodies in requests
app.use(express.json());

// ✅ Connect to the Database
connectDB();

// ✅ Mount Routes
app.use("/api/users", userRoutes); // Handles registration and login
app.use("/api/wallet", walletRoutes); // Handles deposits, withdrawals, transfers
app.use("/api/payments", paymentRoutes); // Handles recurring payment setup and control

// ✅ Root Route - Health Check or Welcome
app.get("/", (req, res) => {
  res.status(200).json({ message: "Fintech-Digital-Wallet-System-PayFlow-" });
});

// ✅ Start Server
const PORT = process.env.PORT || 1000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
