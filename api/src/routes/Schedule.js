const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {parseSortBy} = require('helpers/list');
const policies = require('helpers/policies');
const errorHandler = require('helpers/errorHandler');
const LearningSchedule = mongoose.model('LearningSchedule');

// TODO: swagger, tests
router.get('/', policies.checkJwtAuth, async (req, res) => {
  try {
    const perPage = +req.query.perPage || 30;
    const page = +req.query.page || 1;
    const sort = parseSortBy(req.query.sortBy);
    const query = {owner: req.user.id};

    const items = await LearningSchedule.paginate(query, {page, limit: perPage, sort});
    res.paginated(items).ok();
  } catch (err) {
    errorHandler(res, 'list schedule error')(err);
  }
});

module.exports = (app) => {
  app.use('/schedule', router);
};
