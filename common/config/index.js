const fs = require('fs');
const _ = require('lodash');
const path = require('path');

const config = {
  cache: {
    prefix: '',
    userCacheLifetime: 300, // 5 minutes
    dictionaryCacheLifetime: 60, // 1 minute
  },
};

const {NODE_ENV} = process.env;
let envFileName = './development.js';
const allowedEnvs = ['production', 'test', 'staging'];
if (allowedEnvs.indexOf(NODE_ENV) >= 0) {
  envFileName = `./${NODE_ENV}.js`;
}

envFileName = path.resolve(__dirname, envFileName);
// console.log('loading config', {envFileName});
let envConfig = {};
if (fs.existsSync(envFileName)) {
  envConfig = require(envFileName) || {};
} else {
  console.error("config doesn't exist", {envFileName});
}

const localsConfigFile = path.resolve(__dirname, './locals.js');
const localsConfig = (fs.existsSync(localsConfigFile) && require(localsConfigFile)) || {};

module.exports = _.merge(config, envConfig, localsConfig);
