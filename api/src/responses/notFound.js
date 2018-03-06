const logger = require('../helpers/logger');

module.exports = function() {
  logger.silly('Sending 404 ("Not Found") response');
  this.res.status(404).json();
};
