module.exports = {
  parseSortBy(queryVal) {
    const sortBy = queryVal || 'createdAt:DESC';
    const sort = {};
    sortBy.split(',').forEach((sortParam) => {
      const [sortByField, sortByDirection = 'asc'] = sortParam.split(':');
      if (!['asc', 'desc'].includes(sortByDirection.toLowerCase())) {
        throw new Error('invalid sort direction - can be asc or desc');
      }
      if (sortByField) {
        sort[sortByField] = sortByDirection.toLowerCase();
      }
    });

    return sort;
  },
};
