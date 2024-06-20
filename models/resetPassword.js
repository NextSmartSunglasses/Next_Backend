const mongoose = require("mongoose");

const resetPasswordSchema = new mongoose.Schema({
  email: String,
  token: String,
  createdAt: { type: Date, default: Date.now, expires: "1h" } // token expires in 1 hour
});

const ResetPassword = mongoose.model("ResetPassword", resetPasswordSchema);

module.exports = ResetPassword;
