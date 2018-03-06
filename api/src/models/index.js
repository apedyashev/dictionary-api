const fs = require('fs');
const path = require('path');
const logger = require('../helpers/logger');

module.exports = () => {
  fs
    .readdirSync(__dirname)
    .filter((file) => {
      return file.indexOf('.') !== 0 && file !== 'index.js';
    })
    .forEach((file) => {
      logger.debug('Loading model', {file});
      require(path.join(__dirname, file));
    });
};
