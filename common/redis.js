const bluebird = require('bluebird');
const redis = require('redis');
const config = require('./config');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const redisClient = redis.createClient({host: config.redis.host});

module.exports = redisClient;
