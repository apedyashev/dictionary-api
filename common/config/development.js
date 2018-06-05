module.exports = {
  baseUrl: 'http://localhost:3001',
  // TODO: delete
  mongoose: {
    dbName: 'dictionary-api-dev',
    server: 'mongodb',
  },
  logger: {
    level: 'silly',
  },
  redis: {
    host: 'redis'
  }
};
