const logger = require('dictionary-api-common/helpers/logger');

module.exports = function() {
  logger.silly('Sending 204 ("No Content") response');
  this.res.status(204).json();
};
