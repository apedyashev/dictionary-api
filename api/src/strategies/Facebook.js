const Strategy = require('passport-facebook');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const config = require('../config');
const logger = require('../helpers/logger');

module.exports = new Strategy(
  {
    ...config.passport.facebook.strategy,
    callbackURL: `${config.baseUrl}/auth/facebook/callback`,
    // session: false,
  },
  async (accessToken, refreshToken, profile, next) => {
    try {
      let user = await User.findOne({socialId: profile.id});
      if (!user) {
        user = await User.createFromFacebookProfile(profile);
      }
      next(null, user || false);
    } catch (error) {
      logger.error('Error in passport facebook strategy', {error});
      next(error);
    }
  }
);
