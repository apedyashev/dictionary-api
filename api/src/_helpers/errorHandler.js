module.exports = function errorHandler(res, message) {
  return (err) => {
    try {
      if (err.name === 'ValidationError') {
        res.unprocessableEntity(message, err);
      } else {
        res.serverError(message, err);
      }
    } catch (e) {
      res.serverError('exception in errorHandler', e);
    }
  };
};
