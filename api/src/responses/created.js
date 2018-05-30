/**
 * Examples:
 *   res.created('some message'); // ==> {message: 'some message'}
 *   res.created('some message', {key1: value1}); // ==> {message: 'some message', key1: value1}
 *   res.created({key1: value1}); // ==> {key1: value1}
 */
const _ = require('lodash');
const logger = require('dictionary-api-common/helpers/logger');

module.exports = function(...args) {
  let message;
  let data;
  if (_.isString(args[0])) {
    message = args[0];
    if (_.isPlainObject(args[1])) {
      data = args[1];
    }
  } else if (_.isPlainObject(args[0])) {
    data = args[0];
  }
  const response = {message, ...data};

  logger.silly('Sending 201 ("Created") response', response);
  this.res.status(201).json(response);
};
