// ===============================================
// 👤 User Model - Authentication & Wallet Linkage
// ===============================================

const mongoose = require("mongoose");

// ✅ Define User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true, // typo fixed: 'require' → 'required'
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true, // typo fixed: 'require' → 'required'
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
  },
});

// ✅ Create and Export User Model
const User = mongoose.model("User", userSchema);
module.exports = User;
