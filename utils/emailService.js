// ======================================================
// 📩 Email Service - Sends Notifications via Nodemailer
// ======================================================

const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");

// ✅ Configure Nodemailer Transporter (Using Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// -----------------------------------------------
// 📧 Send an Email Notification
// -----------------------------------------------
exports.sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"FinCore Wallet" <${process.env.EMAIL_USER}>`, // Sender name
    to, // Recipient email
    subject, // Email subject line
    html, // HTML-formatted email body
  });
};
