const crypto = require("crypto");
const twilio = require('twilio');

// Load environment variables
require('dotenv').config();

// Configure Twilio
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

module.exports = function makeForgot(db, E) {
  return async function forgot(req, res, next) {
    const { tel } = req.body;

    if (!tel) {
      return next(new E.InvalidInputError("Phone number is required"));
    }

    const user = await db.User.findOne({ tel });

    if (!user) {
      return next(new E.NotFoundError("User not found"));
    }

    const token = crypto.randomBytes(20).toString("hex");

    const resetPassword = new db.ResetPassword({
      email: user.email,
      token,
      createdAt: Date.now()
    });
    await resetPassword.save();

    try {
      await sendForgotPasswordSMS(tel, token);
      res.send({ message: "Password reset link has been sent" });
    } catch (err) {
      return next(err);
    }
  };
};

async function sendForgotPasswordSMS(tel, token) {
  const resetUrl = `https://5eba-102-159-150-58.ngrok-free.app/reset/${token}`;
  const message = `You requested a password reset. Please click the following link to reset your password: ${resetUrl}`;

  await twilioClient.messages.create({
    body: message,
    from: '+21650380604', // Your Twilio phone number
    to: tel
  });
}
