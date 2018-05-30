const passport = require('passport');

function isAdmin(req, res, next) {
  const isAdmin = req.user && req.user.roles && req.user.roles.includes('admin');
  if (isAdmin) {
    next();
  } else {
    res.forbidden();
    next('forbidden');
  }
}

function canLogin(req, res, next) {
  const canLogin = req.user && req.user.roles && req.user.roles.includes('login');
  if (canLogin) {
    next();
  } else {
    res.forbidden();
    next('forbidden');
  }
}

const policies = {
  checkJwtAuth: [passport.authenticate('jwt', {session: false}), canLogin],
  checkAdmin: [passport.authenticate('jwt', {session: false}), canLogin, isAdmin],
};

module.exports = policies;
