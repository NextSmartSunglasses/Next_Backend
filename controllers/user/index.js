const express = require('express');
const passport = require('./passport'); // Import passport configuration
const maker = require('./use-cases');
const makeCallback = require('../../config/callback');
const generateToken = require('../../middlewares/generateToken'); // Import the generateToken function
let E = null, utils = null;
let router = express.Router();
let usecases;

function init() {
  usecases = maker(utils, E);
  const v = require('./validations')(E);
  router.post('/signin', v.loginvalidator, makeCallback(usecases.signin));
  router.post('/signup', v.signupValidator, makeCallback(usecases.signup));
  router.post('/forgot', makeCallback(usecases.forgot));
  router.post('/reset', makeCallback(usecases.reset));
  router.get('/verify/:id', makeCallback(usecases.verifyUser));

  // Facebook authentication routes
  router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

  router.get('/auth/facebook/callback', (req, res, next) => {
    passport.authenticate('facebook', async (err, user, info) => {
      if (err) {
        console.error('Authentication error:', err); // Log the error
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (!user) {
        console.warn('No user found:', info); // Log the warning
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate a token or session for the user
      const token = generateToken(user); // Use the generateToken function

      // Redirect back to frontend with the token
      res.redirect(`myapp://auth?token=${token}`); // Use custom URL scheme for mobile app
    })(req, res, next);
  });
}

function handler(usecase) {}

exports.router = function (U, errors) {
  utils = U;
  E = errors;
  init();
  return router;
};

exports.useCases = function (U, errors) {
  utils = U;
  E = errors;
  usecases = maker(utils, E);
  return usecases;
};
