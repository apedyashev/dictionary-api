const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const toJson = require('@meanie/mongoose-to-json');
const sluggable = require('mongoose-sluggable');
const mongoosePaginate = require('mongoose-paginate');
const slug = require('slug');
const _ = require('lodash');
const {Collaborator, WordSet} = require('./schemas');
const {withNextId} = require('../../helpers/mongoose');
const Schema = mongoose.Schema;
require('models/Word');
const Word = mongoose.model('Word');

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
 *          translateFrom:
 *            type: string
 *          translateTo:
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
  translateFrom: {
    type: String,
    required: [true, 'required'],
  },
  translateTo: {
    type: String,
    required: [true, 'required'],
  },
  slug: {
    type: String,
    index: true,
    unique: true,
    trim: true,
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
schema.plugin(sluggable, {unique: true, source: ['translateFrom', 'translateTo']});
schema.plugin(mongoosePaginate);

schema.pre('save', async function() {
  delete this.slug;

  // the sluggable plugin cannot handle nested schemas, so generate unique slugs for word sets here
  if (_.isArray(this.wordSets)) {
    this.stats.wordSetsCount = this.wordSets.length;
    this.stats.wordsCount = this.wordSets.reduce((acc, wordSet) => {
      return wordSet.stats.wordsCount + acc;
    }, 0);

    this.wordSets.forEach((wordSet) => {
      if (wordSet.isModified('title')) {
        wordSet.slug = slug(wordSet.title);
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

schema.statics.hasWordSet = async function(dictionaryId, wordSetId) {
  const dict = await this.findOne({_id: dictionaryId});
  if (!dict) {
    return false;
  }

  return !!dict.wordSets.id(wordSetId);
};

mongoose.model('Dictionary', schema);
