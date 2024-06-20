// middlewares/authenticateToken.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization').replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).send('Access Denied');
  }

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified; // Attach the user ID to the request object
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};
