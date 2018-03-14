const logger = require('../helpers/logger');

module.exports = function unprocessableEntity(err) {
  logger.debug('Sending 422 ("Unprocessable Entity") response', {err});

  this.res
    .validationError(err)
    .status(422)
    .json(this.res.responseData);
};
