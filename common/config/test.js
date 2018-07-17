module.exports = {
  baseUrl: 'http://localhost:3002',
  // TODO: delete
  mongoose: {
    dbName: 'dictionary-api-test',
    server: 'mongodb',
  },
  logger: {
    level: 'silly',
  },
  redis: {
    host: 'redis'
  }
};
