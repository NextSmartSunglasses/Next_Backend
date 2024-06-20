const twilio = require("twilio");
const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

module.exports.sendForgotPassword = async function (phone, token) {
  await client.messages.create({
    body: `Please use the following link to reset your password: ${process.env.FRONTEND_URL}/reset-password/${token}`,
    from: "50380604",
    to: phone
  });
};
