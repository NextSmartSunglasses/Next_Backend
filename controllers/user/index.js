const express = require('express');
const passport = require('./passport'); // Import passport configuration
const maker = require('./use-cases');
const makeCallback = require('../../config/callback');
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

  router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

  router.post('/auth/facebook/callback', (req, res) => {
    const accessToken = req.body.access_token;
    console.log('Received access token:', accessToken);

    passport.authenticate('facebook', { session: false }, (err, user, info) => {
      if (err) {
        console.error('Error in Facebook auth:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (!user) {
        console.warn('No user found in Facebook auth');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate a token or session for the user
      const token = generateToken(user); // You need to implement this function
      res.json({ token, user });
    })(req, res);
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
