const moment = require("moment");
const email = require("./email");
const sms = require("./sms");

const calculateDistance = (x, y, x1, y1) => {
  return Math.sqrt(Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2));
};

module.exports = {
  moment,
  calculateDistance,
  email,
  sms
};
