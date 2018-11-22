const express = require('express');
const router = express.Router();
const kue = require('kue');
const mongoose = require('mongoose');
const {parseSortBy} = require('dictionary-api-common/helpers/list');
const passport = require('passport');
const policies = require('dictionary-api-common/helpers/policies')(passport);
const errorHandler = require('dictionary-api-common/helpers/errorHandler');
const config = require('dictionary-api-common/config');
const StatsSignup = mongoose.model('StatsSignup');

// TODO: swagger, tests
router.get('/signups', policies.checkAdmin, async (req, res) => {
  try {
    const perPage = +req.query.perPage || 30;
    const page = +req.query.page || 1;
    const sort = parseSortBy(req.query.sortBy);
    const query = {};

    const items = await StatsSignup.paginate(query, {page, limit: perPage, sort});
    res.paginated(items).ok();
  } catch (err) {
    errorHandler(res, 'list stats signup error')(err);
  }
});

router.post('/import', policies.checkAdmin, async (req, res) => {
  try {
    const jobsQueue = kue.createQueue({
      redis: config.redis,
    });
    const statTypes = req.body.statTypes || [];
    console.log('statTypes', statTypes, statTypes.length);
    for (let i = 0; i < statTypes.length; i++) {
      const statsType = statTypes[i];
      console.log('statsType', statsType);
      const job = await jobsQueue
        .create('import_stats', {type: statsType})
        .removeOnComplete(true)
        .save((err) => {
          console.log('save', err);
          if (!err) {
          }
        });
    }
    res.ok();
  } catch (err) {
    errorHandler(res, 'import jobs creating error')(err);
  }
});

module.exports = (app) => {
  app.use('/stats', router);
};
