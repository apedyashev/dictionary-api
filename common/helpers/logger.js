const winston = require('winston');
// Requiring `winston-mongodb` will expose `winston.transports.MongoDB`
require('winston-mongodb');
const mongoose = require('mongoose');
const config = require('../config');

const logger = winston.createLogger({
  level: config.logger.level,
  format: winston.format.json(),
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
} else {
  mongoose.connection.on('connected', () => {
    // TODO
    // winston.add(
    //   new winston.transports.MongoDB({
    //     db: mongoose.connection.db,
    //     collection: 'log',
    //     decolorize: true,
    //   })
    // );
    logger.exceptions.handle(
      new winston.transports.MongoDB({
        db: mongoose.connection.db,
        collection: 'log',
        decolorize: true,
      })
    );
  });
}

module.exports = logger;
