module.exports = function errorHandler(res, message) {
  return (err) => {
    if (err.name === 'ValidationError') {
      res.unprocessableEntity(err);
    } else {
      res.serverError(message, err);
    }
  };
};
