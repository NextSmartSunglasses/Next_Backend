const bcrypt = require('bcrypt');

module.exports = function makeResetPassword(db, E) {
  return async function resetPassword(req, res, next) {
    const { token, password } = req.body;

    try {
      const resetPasswordDoc = await db.ResetPassword.findOne({ token });
      if (!resetPasswordDoc) {
        throw new E.InvalidTokenError("Invalid or expired reset token");
      }

      const user = await db.User.findOne({ email: resetPasswordDoc.email });
      if (!user) {
        throw new E.NotFoundError("User not found");
      }

      user.password = await bcrypt.hash(password, 10);
      await user.save();

      await db.ResetPassword.deleteOne({ token });

      res.status(200).send({ success: true, message: "Password reset successful" });
    } catch (err) {
      next(err);
    }
  };
};
