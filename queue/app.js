const kue = require('kue');
const cluster = require('cluster');
const mongoose = require('mongoose');
require('./models/LearningSchedule');
const config = require('./config');
const jobHandlers = require('./jobs');
const queue = kue.createQueue({
  redis: {
    // port: 1234,
    host: 'redis',
    // auth: 'password',
    // db: 3, // if provided select a non-default redis db
    // options: {
    //   // see https://github.com/mranney/node_redis#rediscreateclient
    // },
  },
});

require('./models')();
require('dictionary-api-common/mongoose.js')(config);

// const connectionString = `mongodb://${config.mongoose.server}/${config.mongoose.dbName}`;
// console.log('connectionString', connectionString);
// mongoose
//   .connect(connectionString)
//   .then(() => {
//     console.log('MongoDB: connected');
//   })
//   .catch((err) => {
//     console.log('Could not connect to MongoDB!');
//     console.log('err: ', err);
//   });
//
const LearningSchedule = mongoose.model('LearningSchedule');
const User = mongoose.model('User');

const clusterWorkerSize = require('os').cpus().length;

if (cluster.isMaster) {
  kue.app.listen(3005);
  for (let i = 0; i < clusterWorkerSize; i++) {
    cluster.fork();
  }
} else {
  queue.process('email', 10, async (job, done) => {
    let pending = 5,
      total = pending;

    if (jobHandlers[job.type]) {
      const scheduleItem = await LearningSchedule.findOne({_id: job.data.scheduleItemId});
      if (scheduleItem) {
        const user = (await User.findOne({_id: scheduleItem.owner})) || {firstName: 'user'};
        jobHandlers[job.type]({...job.data, user, dicts: scheduleItem.dictionaries});
      }
    }

    // var interval = setInterval(function() {
    //   job.log('sending!');
    //   job.progress(total - pending, total);
    //   --pending || done();
    //   pending || clearInterval(interval);
    // }, 1000);
  });
}
