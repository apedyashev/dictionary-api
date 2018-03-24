module.exports = {
  // baseUrl: 'http://localhost:3001',
  // jwt: {
  //   salt: '',
  // },
  // mongoose: {
  //   dbName: 'jwt-boilerplate',
  //   server: 'mongodb',
  // },
  logger: {
    level: 'info',
  },
  passport: {
    facebook: {
      strategy: {
        clientID: process.env.FB_CLIENT_ID,
        clientSecret: process.env.FB_CLIENT_SECRET,
      },
    },
  },
  translate: {
    yandex: {
      dictionaryKey: process.env.YANDEX_DICT_KEY,
    },
  },
};
