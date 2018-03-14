const _ = require('lodash');
const i18next = require('i18next');
const logger = require('../helpers/logger');

/**
 * @swagger
 *
 * definitions:
 *   ValidationError:
 *     type: object
 *     required:
 *       - validationErrors
 *     properties:
 *       originalError:
 *         type: object
 *         description: Not available in production
 *       validationErrors:
 *         type: object
 *         $ref: "#/definitions/ValidationErrorsObject"
 *   ValidationErrorsObject:
 *     type: object
 *     properties:
 *       fieldName:
 *         type: string
 */
module.exports = function(err) {
  if (err.name === 'ValidationError' && err.errors) {
    const validationErrors = _.mapValues(err.errors, ({message, value, ...rest}, fieldName) => {
      return i18next.t(message, {fieldName, value, ...rest});
    });
    const result = {validationErrors};
    if (process.env !== 'production') {
      result.originalError = err;
    }
    // return result;
    this.res.responseData = result;
  } else if (_.isPlainObject(err)) {
    const validationErrors = serializeMessagesObject(err);
    if (validationErrors) {
      this.res.responseData = {validationErrors};
      // return {validationErrors};
    }
  }
  logger.debug('unable to serialize error - unknown format');

  return this.res;
};

function serializeMessagesObject(err) {
  const validationErrors = _.mapValues(err, (fieldData) => {
    if (_.isString(fieldData)) {
      return i18next.t(fieldData);
    } else if (_.isPlainObject(fieldData) && _.isString(fieldData.message)) {
      const {message, ...rest} = fieldData;
      return i18next.t(message, {...rest});
    }
    return null;
  });

  return _.omitBy(validationErrors, _.isNull);
}
