module.exports = {
  // baseUrl: 'http://localhost:3001',
  // jwt: {
  //   salt: '',
  // },
  // mongoose: {
  //   dbName: 'jwt-boilerplate',
  //   server: 'mongodb',
  // },

  baseUrl: 'http://dict.apedyashev.com/',
  useMultipleCpus: true,
  mongoose: {
    dbName: 'dictionary-api',
    server: 'localhost',
    port: 27017,
  },
  logger: {
    level: 'info',
  },
  passport: {
    facebook: {
      failureRedirect: '/login',
      strategy: {
        callbackURL: `http://dict.apedyashev.com/facebook/callback`,
      },
    },
  },
};
