const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {parseSortBy} = require('dictionary-api-common/helpers/list');
const policies = require('dictionary-api-common/helpers/policies');
const errorHandler = require('dictionary-api-common/helpers/errorHandler');
const Country = mongoose.model('Country');

// TODO: swagger, tests
router.get('/countries', async (req, res) => {
  try {
    const perPage = +req.query.perPage || 30;
    const page = +req.query.page || 1;
    const sort = parseSortBy(req.query.sortBy);
    const query = {};
    const {search} = req.query;
    if (search) {
      query.$or = [{name: new RegExp(search, 'ig')}, {nativeName: new RegExp(search, 'ig')}];
    }

    const items = await Country.paginate(query, {page, limit: perPage, sort});
    res.paginated(items).ok();
  } catch (err) {
    errorHandler(res, 'list schedule error')(err);
  }
});

module.exports = (app) => {
  app.use('/location', router);
};
