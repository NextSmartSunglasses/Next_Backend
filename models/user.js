const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  lastActive: Date,
  email: String,
  password: String,
  name: String,
  lastname: String,
  verified: Boolean,
  loginStamp: Date,
  role: String,
  facebookId: String,
  accessToken: String,
  tel: String
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
