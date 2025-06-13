const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, require: true },
  email: { type: String, unique: true },
  passwordHash: { type: String, require: true },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
});

const User = new mongoose.model("User", userSchema);

module.exports = User;
