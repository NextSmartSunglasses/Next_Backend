const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports.sendForgotPassword = async function (email, token) {
  const msg = {
    to: email,
    from: "larbiamine2000@gmail.com", // Use your verified SendGrid email
    subject: "Password Reset",
    text: `Please use the following link to reset your password: ${process.env.FRONTEND_URL}/reset-password/${token}`,
    html: `<strong>Please use the following link to reset your password: <a href="${process.env.FRONTEND_URL}/reset-password/${token}">Reset Password</a></strong>`
  };
  await sgMail.send(msg);
};
