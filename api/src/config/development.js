module.exports = {
  baseUrl: 'http://localhost:3001',
  useMultipleCpus: false,
  jwt: {
    salt: 'cd5%7cd8*&09lkjbhg^!#ch;mbcgwewe$6%8v7df$9*32*4s3f2s4',
  },
  mongoose: {
    dbName: 'dictionary-api-dev',
    server: 'mongodb',
  },
  logger: {
    level: 'silly',
  },
};
