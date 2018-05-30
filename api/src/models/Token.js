const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
const {cache: {tokenCacheLifetime}} = require('../config');
const {buildCacheKey} = require('dictionary-api-common/helpers/cache');
const redisClient = require('../../redis.js');
const config = require('../config');

function getCacheKey(id) {
  return buildCacheKey('tokens', id);
}

const schema = new Schema({
  // allows to logout user from all devices
  userId: {
    type: String,
  },
  token: {
    type: String,
  },
  // deviceId allows to logout all sessions except this one
  deviceId: {
    type: String,
  },
});

schema.statics.getCacheKey = function(id) {
  return buildCacheKey('tokens', id);
};

schema.statics.sign = async function(user, deviceId) {
  const payload = {id: user.id};
  const token = jwt.sign(payload, config.jwt.salt);
  const cacheKey = getCacheKey(token);
  await redisClient.setAsync(cacheKey, true, 'EX', tokenCacheLifetime);
  return this.create({userId: user.id, token, deviceId});
};

schema.statics.isValid = async function(token) {
  const cacheKey = getCacheKey(token);
  let isValid = await redisClient.getAsync(cacheKey);
  if (!isValid) {
    isValid = await this.findOne({token});
    if (!!isValid) {
      await redisClient.setAsync(cacheKey, true, 'EX', tokenCacheLifetime);
    }
  }
  return !!isValid;
};

schema.statics.invalidate = async function(token) {
  const cacheKey = getCacheKey(token);
  await redisClient.delAsync(cacheKey, true);
  return this.remove({token});
};

mongoose.model('Token', schema);
