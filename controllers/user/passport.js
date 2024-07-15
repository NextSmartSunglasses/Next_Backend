const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../../models/user'); // Adjust the path as necessary

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Log the environment variables to check if they are being loaded
console.log('FACEBOOK_APP_ID in passport.js:', process.env.FACEBOOK_APP_ID);
console.log('FACEBOOK_APP_SECRET in passport.js:', process.env.FACEBOOK_APP_SECRET);

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "https://next-backend-q0ev.onrender.com/s/api/user/auth/facebook/callback", // Adjust the URL and port as necessary
  profileFields: ['id', 'displayName', 'email'],
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ facebookId: profile.id });
      if (!user) {
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          facebookId: profile.id,
          accessToken: accessToken,
        });
        await user.save();
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

module.exports = passport;
