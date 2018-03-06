const logger = require('../helpers/logger');

module.exports = function() {
  logger.error('Sending 403 ("Forbidden") response');
  this.res.status(403).json();
};
