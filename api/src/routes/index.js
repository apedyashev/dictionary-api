const fs = require('fs');
const path = require('path');
const logger = require('dictionary-api-common/helpers/logger');

module.exports = (app) => {
  fs
    .readdirSync(__dirname)
    .filter((file) => {
      return file.indexOf('.') !== 0 && file !== 'index.js';
    })
    .forEach((file) => {
      logger.debug('Loading route', {file});
      require(path.join(__dirname, file))(app);
    });
};
