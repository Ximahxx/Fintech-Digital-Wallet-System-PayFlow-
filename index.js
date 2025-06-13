const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const walletRoutes = require("./routes/walletRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
require("./utils/paymentProcessor");

const app = express();
app.use(express.json());

connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/payments", paymentRoutes);
app.get("/", (req, res) => {
  res.status(200).send("Fintech-Digital-Wallet-System-PayFlow-").json({ message: "Fintech-Digital-Wallet-System-PayFlow-" });
});

const PORT = process.env.PORT || 1000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
