const _ = require('lodash');

module.exports = function(data) {
  if (!data || !data.docs) {
    throw Error('invalid input data format in the paginated serializer');
  }
  this.res.responseData = {
    items: data.docs,
    pagination: _.omit(data, 'docs'),
  };

  return this.res;
};
