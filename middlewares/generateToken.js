const jwt = require('jsonwebtoken');

module.exports = function generateToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
  };
  return jwt.sign(payload, process.env.SignKey, { expiresIn: '1h' });
};
