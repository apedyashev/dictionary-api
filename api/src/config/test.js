module.exports = {
  baseUrl: 'http://localhost:3002',
  fallbackLng: 'dev',
  allowedLanguages: ['dev'],
  // only for testing
  disableI18NextLoadPath: true,
  jwt: {
    salt: 'c1dd5%7cd8*&09lkjbhg^d!#ch;NbXgwDewe$6%8v7df$9s*32*4s3f2sN4',
  },
  mongoose: {
    dbName: 'jwt-boilerplate-test',
    server: 'mongodb',
  },
  logger: {
    level: 'error',
  },
};
