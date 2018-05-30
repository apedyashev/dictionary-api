const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const logger = require('dictionary-api-common/helpers/logger');

const serializers = {};
function loadSerializers() {
  fs
    .readdirSync(__dirname)
    .filter((file) => {
      return file.indexOf('.') !== 0 && file !== 'index.js';
    })
    .forEach((file) => {
      const baseName = path.basename(file, '.js');
      logger.debug('Loading serializer', {file, baseName});
      const serializer = require(path.join(__dirname, file));
      serializers[baseName] = serializer;
    });
}
loadSerializers();

module.exports = (req, res, next) => {
  _.each(serializers, (responseFn, responseFnName) => {
    res[responseFnName] = responseFn.bind({req, res});
  });
  next();
};
