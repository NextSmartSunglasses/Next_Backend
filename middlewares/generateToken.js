const jwt = require('jsonwebtoken');

module.exports = function generateToken(user) {
  const payload = {
    id: user._id,
    name: user.name,
    lastname: user.lastname,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    loginStamp: new Date().toISOString(),
    tel: user.tel,
  };
  return jwt.sign(payload, process.env.SignKey, { expiresIn: '1h' });
};
