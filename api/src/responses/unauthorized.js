const logger = require('dictionary-api-common/helpers/logger');

module.exports = function(message) {
  logger.error('Sending 401 ("Unautorized") response', {message});
  this.res.status(401).json();
};
