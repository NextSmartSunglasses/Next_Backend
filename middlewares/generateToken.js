const jwt = require('jsonwebtoken');

module.exports = function generateToken(user) {
  const loginStamp = new Date().toISOString();

  const payload = {
    data: {
      id: user._id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      loginStamp: loginStamp,
      tel: user.tel,
    }
  };
  return jwt.sign(payload, process.env.SignKey, { expiresIn: '1h' });
  
};
