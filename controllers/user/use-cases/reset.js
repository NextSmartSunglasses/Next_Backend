module.exports = function makeReset(db, bcrypt, E, utils) {
  return async function reset(req, res, next) {
    let { token, newpassword } = req.body;

    let resetPassword = await db.ResetPassword.findOne({ token });

    if (!resetPassword) {
      throw new E.NotFoundError("Invalid or expired token");
    }

    let password = await bcrypt.hash(newpassword, 10);

    await db.User.updateOne({ email: resetPassword.email }, { password });

    await db.ResetPassword.findOneAndDelete({ token });

    res.send("Password has been reset");
  };
};
