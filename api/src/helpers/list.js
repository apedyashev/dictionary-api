module.exports = {
  // TODO: unit test
  parseSortBy(queryVal) {
    const sortBy = queryVal || 'createdAt:DESC';
    const sort = {};
    sortBy.split(',').forEach((sortParam) => {
      const [sortByField, sortByDirection] = sortParam.split(':');
      sort[sortByField] = (sortByDirection || '').toLowerCase();
    });

    return sort;
  },
};
