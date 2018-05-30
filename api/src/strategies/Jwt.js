const mongoose = require('mongoose');
const User = mongoose.model('User');
const Token = mongoose.model('Token');
const passportJwt = require('passport-jwt');
const i18next = require('i18next');
const config = require('../config');
const logger = require('dictionary-api-common/helpers/logger');

const {ExtractJwt, Strategy} = passportJwt;

// extracts token from header and adds it to request
function customHeaderExtractor(req) {
  const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  req.jwtToken = token;
  return token;
}

const jwtOptions = {
  jwtFromRequest: customHeaderExtractor,
  secretOrKey: config.jwt.salt,
  passReqToCallback: true,
};

module.exports = new Strategy(jwtOptions, async (req, jwtPayload, next) => {
  try {
    // check that token hasn't been invalidated
    const isTokenValid = await Token.isValid(req.jwtToken);
    if (isTokenValid) {
      const user = await User.findCachedById(jwtPayload.id);
      if (user && user.locale) {
        i18next.changeLanguage(user.locale);
        req.i18n.changeLanguage(user.locale);
      }
      next(null, user || false);
    } else {
      next(null, false);
    }
  } catch (error) {
    logger.error('Error in jwt facebook strategy', {error});
    next(error);
  }
});
