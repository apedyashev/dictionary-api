module.exports = {
  baseUrl: 'http://localhost:3001',
  // TODO: delete
  mongoose: {
    dbName: 'dictionary-api-dev',
    server: 'mongodb',
    port: 27017,
  },
  logger: {
    level: 'silly',
  },
  redis: {
    host: 'redis'
  }
};
