const _ = require('lodash');

module.exports = {
  parseSortBy(queryVal, {prefix, numberedOrdering} = {prefix: null, numberedOrdering: false}) {
    const sortBy = queryVal || 'createdAt:DESC';
    const sort = {};
    sortBy.split(',').forEach((sortParam) => {
      const [sortByField, sortByDirection = 'asc'] = sortParam.split(':');
      if (!['asc', 'desc'].includes(sortByDirection.toLowerCase())) {
        throw new Error('invalid sort direction - can be asc or desc');
      }
      if (sortByField) {
        sort[sortByField] = sortByDirection.toLowerCase();
        if (numberedOrdering) {
          const orderingMap = {asc: 1, desc: -1};
          sort[sortByField] = orderingMap[sort[sortByField]];
        }
      }
    });

    if (prefix) {
      return _.mapKeys(sort, (val, key) => `${prefix}.${key}`);
    }

    return sort;
  },
};
