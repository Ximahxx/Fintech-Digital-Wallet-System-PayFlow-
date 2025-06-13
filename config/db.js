const mongoose = require("mongoose");

// Establish connection to MongoDB database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI).then(() => {
      console.log("✅ Database connected...");
    });
  } catch (error) {
    console.error("❌ Database connection error:", error);
  }
};

module.exports = connectDB;
