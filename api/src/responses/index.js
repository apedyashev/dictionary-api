const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const logger = require('../helpers/logger');

const customReponses = {};
function loadResponses() {
  fs
    .readdirSync(__dirname)
    .filter((file) => {
      return file.indexOf('.') !== 0 && file !== 'index.js';
    })
    .forEach((file) => {
      const baseName = path.basename(file, '.js');
      logger.debug('Loading response', {file, baseName});
      const customReponse = require(path.join(__dirname, file));
      customReponses[baseName] = customReponse;
    });
}
loadResponses();

module.exports = (req, res, next) => {
  _.each(customReponses, (responseFn, responseFnName) => {
    res[responseFnName] = responseFn.bind({req, res});
  });
  next();
};
