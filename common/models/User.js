const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const crypto = require('crypto');
const _ = require('lodash');
const logger = require('../helpers/logger');
const {cache: {userCacheLifetime}} = require('../config');
const {buildCacheKey} = require('../helpers/cache');
const redisClient = require('../redis.js');
const Schema = mongoose.Schema;

function getCacheKey(id) {
  return buildCacheKey('users', id);
}
const isPasswordLengthValid = function(password) {
  return password && password.length > 6;
};

// A Validation function for local strategy properties
/* eslint-disable no-unused-vars */
const validateLocalStrategyProperty = function(property) {
  return (this.provider !== 'local' && !this.updated) || property.length;
};
/* eslint-enable no-unused-vars */

// A Validation function for local strategy password
const validateLocalStrategyPassword = function(password) {
  return this.provider !== 'local' || isPasswordLengthValid(password);
};

/**
 * @swagger
 * definitions:
 *   BaseModel:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *       createdAt:
 *         type: string
 *         format: "date"
 *       updatedAt:
 *         type: string
 *         format: "date"
 *
 *   SerializedUser:
 *     allOf:
 *       - $ref: '#/definitions/BaseModel'
 *       - properties:
 *          email:
 *            type: string
 *          roles:
 *            type: array
 *            items:
 *              type: string
 */
const schema = new Schema({
  email: {
    type: String,
    trim: true,
    unique: true,
    default: '',
    match: [/.+\@.+\..+/, 'invalid email'],
    required: [true, 'required'],
  },
  firstName: {
    type: String,
    required: [true, 'required'],
    // can be required if you use a strategy that doesn't provide first name
    // validate: [validateLocalStrategyProperty, 'please fill in your first name'],
  },
  lastName: {
    type: String,
    required: [true, 'required'],
    // can be required if you use a strategy that doesn't provide last name
    // validate: [validateLocalStrategyProperty, 'please fill in your first name'],
  },
  roles: {
    type: [
      {
        type: String,
        enum: ['login', 'admin'],
      },
    ],
    default: ['login'],
    // type: Array,
    // default: ['login'],
  },
  password: {
    type: String,
    validate: [validateLocalStrategyPassword, 'password must be longer'],
    required: [true, 'required'],
  },
  socialId: {
    type: String,
  },
  provider: {
    type: String,
  },
  salt: {
    type: String,
  },
  locale: {
    type: String,
    default: 'en-US',
  },
  exerciseTime: {
    type: String,
    default: '18:00',
  },
  timezone: {
    type: String,
    default: 'Europe/London',
  },
  country: {
    type: Schema.Types.ObjectId,
    ref: 'Country',
    default: null,
  },
});

schema.plugin(timestamps);
// schema.plugin(mongoosePaginate);

schema.path('email').validate({
  isAsync: true,
  validator: async function(value, respond) {
    try {
      const count = await this.model('User').count({_id: {$ne: this._id}, email: value});
      respond(!count);
    } catch (err) {
      logger.error('email counting error', err);
      return respond(false);
    }
  },
  message: 'email is already taken',
});

schema.pre('validate', function(next) {
  if (
    this.provider === 'local' &&
    this.isModified('password') &&
    isPasswordLengthValid(this.password) &&
    this.password !== this.passwordConfirmation
  ) {
    this.invalidate('passwordConfirmation', 'enter the same password');
  }
  next();
});

// Hook a pre save method to hash the password
schema.pre('save', function(next) {
  if (isPasswordLengthValid(this.password) && this.isModified('password')) {
    this.salt = Buffer.from(crypto.randomBytes(16).toString('base64'), 'base64');
    this.password = this.hashPassword(this.password);
  }
  next();
});

const cachableFields = ['roles', 'locale'];
schema.post('save', async function(user) {
  const newData = JSON.stringify(_.pick(user, cachableFields));
  const cacheKey = getCacheKey(user._id);
  await redisClient.setAsync(cacheKey, newData, 'EX', userCacheLifetime);
});

schema.statics.findCachedById = async function(id) {
  const cacheKey = getCacheKey(id);
  let cachedUser;
  const readFromDb = async () => {
    const user = await this.findOne({_id: id});
    if (user) {
      cachedUser = _.pick(user, cachableFields);
      await redisClient.setAsync(
        // `users/${user._id}`,
        cacheKey,
        JSON.stringify(cachedUser),
        'EX',
        userCacheLifetime
      );
    }
  };

  try {
    cachedUser = JSON.parse(await redisClient.getAsync(cacheKey));
    if (!cachedUser) {
      await readFromDb();
    }
  } catch (err) {
    await readFromDb();
  }
  return {id, ...cachedUser};
};

schema.statics.createFromFacebookProfile = async function({emails, name, id}) {
  const email = emails[0] && emails[0].value;
  const count = await this.model('User').count({email});
  if (count) {
    // add social id to the existing user
    return await this.findOneAndUpdate({email: email}, {socialId: id}, {new: true});
  }
  return this.create({
    firstName: name.givenName,
    lastName: name.familyName,
    email,
    socialId: id,
    provider: 'facebook',
  });
};

schema
  .virtual('passwordConfirmation')
  .get(function() {
    return this._passwordConfirmation;
  })
  .set(function(value) {
    this._passwordConfirmation = value;
  });

// Create instance method for hashing a password
schema.methods.hashPassword = function(password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('base64');
  } else {
    return password;
  }
};

// Create instance method for authenticating user
schema.methods.authenticate = function(password) {
  return this.password === this.hashPassword(password);
};

schema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.salt;
    delete ret.provider;
    delete ret.passwordConfirmation;
    delete ret._id;
    return ret;
  },
});

module.exports = schema;
// mongoose.model('User', schema);
