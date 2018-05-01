const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const toJson = require('@meanie/mongoose-to-json');
const mongoosePaginate = require('mongoose-paginate');
const slug = require('slug');
const _ = require('lodash');
const {cache: {dictionaryCacheLifetime}} = require('config');
const {buildCacheKey} = require('helpers/cache');
const {withNextId} = require('helpers/mongoose');
const redisClient = require('../../../redis.js');
const {Collaborator, WordSet} = require('./schemas');
const Schema = mongoose.Schema;
require('models/Word');
const Word = mongoose.model('Word');

function getCacheKey(id) {
  return buildCacheKey('dictionaries', id);
}

/**
 * @swagger
 * definitions:
 *   SerializedDictionary:
 *     allOf:
 *       - $ref: '#/definitions/BaseModel'
 *       - properties:
 *          owner:
 *            type: string
 *          title:
 *            type: string
 *          translateDirection:
 *            type: string
 *          slug:
 *            type: string
 *          collaborators:
 *            type: array
 *            items:
 *              $ref: "#/definitions/SerializedCollaborator"
 *          wordSets:
 *            type: array
 *            items:
 *              $ref: "#/definitions/SerializedWordset"
 *          stats:
 *            type: object
 *            properties:
 *              wordSetsCount:
 *                type: number
 *              wordsCount:
 *                type: number
 */
const schema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'required'],
  },
  title: {
    type: String,
    required: [true, 'required'],
  },
  translateDirection: {
    type: String,
    default: null,
  },
  slug: {
    type: String,
    index: true,
    unique: false,
    trim: true,
    default: null,
  },
  collaborators: {
    type: [Collaborator],
    default: [],
  },
  wordSets: {
    type: [WordSet],
    default: [],
  },
  stats: {
    wordSetsCount: {
      type: Number,
      default: 0,
    },
    wordsCount: {
      type: Number,
      default: 0,
    },
  },
});
schema.plugin(timestamps);
schema.plugin(toJson);
// schema.plugin(sluggable, {
//   unique: false,
//   source: function(doc) {
//     if (doc.translateDirection) {
//       return String(doc.translateDirection).trim();
//     }
//     return String(doc.title).trim();
//   },
// });
schema.plugin(mongoosePaginate);

// checks if dictionanry with given translateDirection or title already exist
schema.path('slug').validate({
  isAsync: true,
  validator: async function(value, respond) {
    try {
      const count = await this.model('Dictionary').count({
        _id: {$ne: this._id},
        owner: this.owner,
        slug: value,
      });
      respond(!count);
    } catch (err) {
      logger.error('dictionary slug counting error', err);
      return respond(false);
    }
  },
  message: 'dictionary already exist',
});

// generate slug before validation
schema.pre('validate', async function() {
  if (this.translateDirection) {
    this.slug = slug(String(this.translateDirection).trim()).toLowerCase();
  } else {
    this.slug = slug(String(this.title).trim()).toLowerCase();
  }
});

schema.pre('save', async function() {
  // the sluggable plugin cannot handle nested schemas, so generate unique slugs for word sets here
  if (_.isArray(this.wordSets)) {
    this.stats.wordSetsCount = this.wordSets.length;
    this.stats.wordsCount = this.wordSets.reduce((acc, wordSet) => {
      return wordSet.stats.wordsCount + acc;
    }, 0);

    this.wordSets.forEach((wordSet) => {
      if (wordSet.isModified('title')) {
        wordSet.slug = slug(wordSet.title).toLowerCase();
      }
      // do not allow to update state directly
      delete wordSet.stats;
    });
    // make slugs unique
    this.wordSets.forEach((wordSet) => {
      if (wordSet.isNew || wordSet.isModified('title')) {
        const allSlugs = _(this.wordSets)
          .filter((ws) => ws._id !== wordSet._id)
          .map('slug')
          .value();
        wordSet.slug = withNextId(wordSet.slug, allSlugs, 0);
      }
    });
  }
});

schema.pre('remove', async function() {
  // remove all the associated words
  await Word.remove({dictionary: this._id});
});

const cachableFields = ['title', 'slug'];
schema.post('save', async function(doc) {
  const newData = JSON.stringify(_.pick(doc, cachableFields));
  const cacheKey = getCacheKey(doc._id);
  await redisClient.setAsync(cacheKey, newData, 'EX', dictionaryCacheLifetime);
});

schema.statics.hasWordSet = async function(dictionaryId, wordSetId) {
  const dict = await this.findOne({_id: dictionaryId});
  if (!dict) {
    return false;
  }

  return !!dict.wordSets.id(wordSetId);
};

// TODO: DRY it up?
schema.statics.findCachedById = async function(id) {
  const cacheKey = getCacheKey(id);
  let cachedDoc;
  const readFromDb = async () => {
    const doc = await this.findOne({_id: id});
    if (doc) {
      cachedDoc = _.pick(doc, cachableFields);
      await redisClient.setAsync(
        cacheKey,
        JSON.stringify(cachedDoc),
        'EX',
        dictionaryCacheLifetime
      );
    }
  };

  try {
    cachedDoc = JSON.parse(await redisClient.getAsync(cacheKey));
    if (!cachedDoc) {
      await readFromDb();
    }
  } catch (err) {
    await readFromDb();
  }
  return {id, ...cachedDoc};
};

mongoose.model('Dictionary', schema);
