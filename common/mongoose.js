const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
// const config = require('./src/config');
// require('./models')();

module.exports = (config) => {
  // TODO
  const connectionString = `mongodb://${config.mongoose.server}/${config.mongoose.dbName}`;
  console.log('connectionString', connectionString);
  mongoose
    .connect(connectionString)
    .then(() => {
      console.log('MongoDB: connected');
    })
    .catch((err) => {
      console.log('Could not connect to MongoDB!');
      console.log('err: ', err);
    });

  return mongoose;
};
