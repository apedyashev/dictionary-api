const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const device = require('express-device');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-express-middleware');
const i18nextFsBackend = require('i18next-node-fs-backend');
const config = require('./src/config');

require('./mongoose.js')();

// TODO move to strategies/index.js
const jwtStrategy = require('./src/strategies/Jwt');
const facebookStrategy = require('./src/strategies/Facebook');

passport.use(jwtStrategy);
passport.use(facebookStrategy);
app.use(passport.initialize());

app.use(morgan('dev'));

i18next
  .use(i18nextMiddleware.LanguageDetector)
  .use(i18nextFsBackend)
  .init({
    // debug: true,
    preload: config.allowedLanguages,
    fallbackLng: config.fallbackLng,
    backend: {
      loadPath: `${__dirname}/locales/{{lng}}/{{ns}}.json`,
    },
  });
app.use(bodyParser.json());
app.use(device.capture());
app.use(i18nextMiddleware.handle(i18next, {}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(cors());
app.use(require('./src/responses'));
require('./src/routes')(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log('error handler', err);
  // render the error page
  res.status(err.status || 500);
  res.end();
});

module.exports = app;
