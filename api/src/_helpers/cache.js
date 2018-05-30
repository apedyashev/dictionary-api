const {cache: {prefix}} = require('../config');

module.exports = {
  buildCacheKey: (model, id) => {
    return `${prefix}/${model}/${id}`;
  },
};
