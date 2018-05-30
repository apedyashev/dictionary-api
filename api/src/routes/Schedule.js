const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const {parseSortBy} = require('dictionary-api-common/helpers/list');
const passport = require('passport');
const policies = require('dictionary-api-common/helpers/policies')(passport);
const errorHandler = require('dictionary-api-common/helpers/errorHandler');
const LearningSchedule = mongoose.model('LearningSchedule');
const User = mongoose.model('User');

// TODO: swagger, tests
router.get('/', policies.checkJwtAuth, async (req, res) => {
  try {
    const perPage = +req.query.perPage || 30;
    const page = +req.query.page || 1;
    const sort = parseSortBy(req.query.sortBy);
    // show today's items even if they are in the past
    const user = await User.findOne({_id: req.user.id});
    const timeInUserTimezone = moment()
      .tz(user.timezone || 'Europe/London')
      .format('YYYY-MM-DD HH:mm');
    const startOfToday = moment(timeInUserTimezone)
      .startOf('day')
      .toDate();
    const query = {owner: req.user.id, date: {$gte: startOfToday}};

    // NOTE: paginate calls the find() function that triggers post:find hook to populate dictionaries
    const items = await LearningSchedule.paginate(query, {page, limit: perPage, sort});
    res.paginated(items).ok();
  } catch (err) {
    errorHandler(res, 'list schedule error')(err);
  }
});

module.exports = (app) => {
  app.use('/schedule', router);
};
