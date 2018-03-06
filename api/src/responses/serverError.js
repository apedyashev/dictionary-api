const logger = require('../helpers/logger');
const util = require('util');
/**
 * @swagger
 * definitions:
 *   ResponseServerError:
 *     required:
 *      - message
 *     properties:
 *       message:
 *         type: string
 *       error:
 *         description: hidden in production
 *         type: object
 */
module.exports = function(message, error) {
  logger.error('Sending 500 ("Server Error") response', {message, error: util.inspect(error)});
  const response = {message};
  if (process.env !== 'production') {
    response.error = util.inspect(error);
  }
  this.res.status(500).json(response);
};
