const logger = require('../helpers/logger');

module.exports = function() {
  logger.error('Sending 400 ("Bad Request") response');
  this.res.status(400).json();
};
