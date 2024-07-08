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
  callbackURL: "http://localhost:4000/s/api/user/auth/facebook/callback", // Adjust the URL and port as necessary
  profileFields: ['id', 'displayName', 'email'],
},
  (accessToken, refreshToken, profile, done) => {
    User.findOne({ facebookId: profile.id }, (err, user) => {
      if (err) return done(err);
      if (!user) {
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          facebookId: profile.id,
          accessToken: accessToken,
        });
        user.save((err) => {
          if (err) console.log(err);
          return done(err, user);
        });
      } else {
        return done(err, user);
      }
    });
  }
));

module.exports = passport;
