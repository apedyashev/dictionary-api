const logger = require('../helpers/logger');
const _ = require('lodash');

module.exports = function unprocessableEntity(...args) {
  logger.debug('Sending 422 ("Unprocessable Entity") response', args);

  const {t} = this.req;
  let message;
  let err;
  if (_.isString(args[0])) {
    message = t(args[0]);
    if (_.isObject(args[1])) {
      err = args[1];
    }
  } else if (_.isObject(args[0])) {
    err = args[0];
  }

  this.res
    .validationError(err)
    .status(422)
    .json({message, ...this.res.responseData});
};
