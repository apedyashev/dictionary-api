const _ = require('lodash');

module.exports = function(data) {
  if (!data || !data.docs) {
    throw Error('invalid input data format in the paginated serializer');
  }
  const pagination = _.omit(data, 'docs');
  pagination.perPage = pagination.limit;
  delete pagination.limit;
  this.res.responseData = {
    items: data.docs,
    pagination,
  };

  return this.res;
};
