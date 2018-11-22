const mongoose = require('mongoose');
const User = mongoose.model('User');
const StatsSignup = mongoose.model('StatsSignup');

module.exports = async function(job) {
  const {type} = job.data;
  console.log('precess import_stats', job.data);
  try {
    if (type === 'signups') {
      const stats = await User.aggregate([
        {
          $project: {
            signupDate: {$dateToString: {format: '%Y-%m-%d', date: '$createdAt'}},
          },
        },
        {
          $group: {
            _id: '$signupDate',
            value: {$sum: 1},
          },
        },
      ]);
      console.log('stats', stats);
      StatsSignup.insertMany(stats.map((doc) => ({date: doc._id, value: doc.value})));
    }
  } catch (err) {
    console.log('import stats job error', err);
  }
};
