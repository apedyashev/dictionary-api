const serializeValidationError = require('../serializers/validationError.js');
const logger = require('../helpers/logger');

module.exports = function unprocessableEntity(err) {
  logger.debug('Sending 422 ("Unprocessable Entity") response', {err});

  const validation = serializeValidationError(err);
  this.res.status(422).json(validation);
};
