const fs = require('fs');
const _ = require('lodash');
const path = require('path');
// const logger = require('../helpers/logger');

const config = {
  appName: 'JWT API boilerplate',
  useMultipleCpus: true,
  fallbackLng: 'en-US',
  allowedLanguages: ['en-US', 'ru-RU', 'de-CH'],
  cache: {
    prefix: '',
    userCacheLifetime: 300, // 5 minutes
    tokenCacheLifetime: 900, // 15 minutes
  },
  jwt: {
    salt: '--- change this here or in env config file ---',
  },
  mongoose: {
    dbName: 'dictionary-api',
    server: 'mongodb',
  },
  passport: {
    facebook: {
      failureRedirect: '/login',
      strategy: {
        // NOTE: for public repos secret data must be set in git-ingored config/locals.js
        // clientID: '',
        // clientSecret: '',
        profileFields: ['name', 'displayName', 'emails'],
      },
    },
  },
};

const {NODE_ENV} = process.env;
let envFileName = './development.js';
const allowedEnvs = ['production', 'test', 'staging'];
if (allowedEnvs.indexOf(NODE_ENV) >= 0) {
  envFileName = `./${NODE_ENV}.js`;
}

envFileName = path.resolve(__dirname, envFileName);
console.log('loading config', {envFileName});
let envConfig = {};
if (fs.existsSync(envFileName)) {
  envConfig = require(envFileName) || {};
} else {
  console.error("config doesn't exist", {envFileName});
}

const localsConfigFile = path.resolve(__dirname, './locals.js');
const localsConfig = (fs.existsSync(localsConfigFile) && require(localsConfigFile)) || {};

module.exports = _.merge(config, envConfig, localsConfig);
