const twilio = require('twilio');

// Load environment variables
require('dotenv').config();

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendForgotPasswordSMS(tel, token) {
  const resetUrl = `https://5eba-102-159-150-58.ngrok-free.app/reset/${token}`;
  const message = `You requested a password reset. Please click the following link to reset your password: ${resetUrl}`;

  await twilioClient.messages.create({
    body: message,
    from: '+21650380604', // Your Twilio phone number
    to: tel
  });
}

module.exports = {
  sendForgotPasswordSMS,
};
