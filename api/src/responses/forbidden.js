const logger = require('dictionary-api-common/helpers/logger');

module.exports = function(message) {
  logger.error('Sending 403 ("Forbidden") response', {message});
  this.res.status(403).json({message});
};
