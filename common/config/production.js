module.exports = {
  baseUrl: 'http://dict.apedyashev.com',
  logger: {
    level: 'info',
  },
  redis: {
    host: 'localhost'
  },
  mongoose: {
    dbName: 'dictionary-api',
    server: 'localhost',
    port: 27017,
  },
  // email: {
  //   auth: {
  //     user: '',
  //     pass: '',
  //   },
  // },
};
