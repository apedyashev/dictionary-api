/**
 * Examples:
 *   res.ok('some message'); // ==> {message: 'some message'}
 *   res.ok('some message', {key1: value1}); // ==> {message: 'some message', key1: value1}
 *   res.ok({key1: value1}); // ==> {key1: value1}
 */
const logger = require('../helpers/logger');
const _ = require('lodash');

module.exports = function(...args) {
  let message;
  let data;
  const {t} = this.req;
  if (_.isString(args[0])) {
    message = t(args[0]);
    if (_.isPlainObject(args[1])) {
      data = args[1];
    }
  } else if (_.isPlainObject(args[0])) {
    data = args[0];
  }
  const response = {message, ...data};

  logger.silly('Sending 200 ("OK") response', response);
  this.res.status(200).json(response);
};
