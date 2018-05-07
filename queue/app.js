const kue = require('kue');
const cluster = require('cluster');
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

const clusterWorkerSize = require('os').cpus().length;

if (cluster.isMaster) {
  kue.app.listen(3005);
  for (let i = 0; i < clusterWorkerSize; i++) {
    cluster.fork();
  }
} else {
  queue.process('email', 10, function(job, done) {
    let pending = 5,
      total = pending;
    console.log('job received', job.type, job.data);

    if (jobHandlers[job.type]) {
      jobHandlers[job.type](job.data);
    }

    var interval = setInterval(function() {
      job.log('sending!');
      job.progress(total - pending, total);
      --pending || done();
      pending || clearInterval(interval);
    }, 1000);
  });
}
