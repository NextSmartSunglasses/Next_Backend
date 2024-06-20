const crypto = require("crypto");

module.exports = function makeForgot(db, E, utils) {
  return async function forgot(req, res, next) {
    const { email, tel } = req.body;

    let user;
    if (email) {
      user = await db.User.findOne({ email });
    } else if (tel) {
      user = await db.User.findOne({ tel });
    } else {
      throw new E.InvalidInputError("Email or phone number is required");
    }

    if (!user) {
      throw new E.NotFoundError("User not found");
    }

    const token = crypto.randomBytes(20).toString("hex");

    const resetPassword = new db.ResetPassword({
      email: user.email,
      token,
      createdAt: Date.now()
    });
    await resetPassword.save();

    if (email) {
      await utils.email.sendForgotPassword(email, token);
    } else if (tel) {
      await utils.sms.sendForgotPassword(tel, token);
    }

    res.send({ message: "Password reset link has been sent" });
  };
};
