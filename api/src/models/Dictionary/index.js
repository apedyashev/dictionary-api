const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const toJson = require('@meanie/mongoose-to-json');
const sluggable = require('mongoose-sluggable');
const slug = require('slug');
const _ = require('lodash');
const {Collaborator, WordSet} = require('./schemas');
const {withNextId} = require('../../helpers/mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
schema.plugin(sluggable, {source: ['translateFrom', 'translateTo']});

schema.pre('save', async function() {
  // the sluggable plugin cannot handle nested schemas, so generate unique slugs for word sets here
  if (this.isNew && _.isArray(this.wordSets)) {
    this.wordSets.forEach((wordSet) => {
      wordSet.slug = slug(wordSet.title);
    });
    this.wordSets.forEach((wordSet) => {
      const allSlugs = _(this.wordSets)
        .filter((ws) => ws._id !== wordSet._id)
        .map('slug')
        .value();
      wordSet.slug = withNextId(wordSet.slug, allSlugs, 0);
    });
  } else if (_.isArray(this.wordSets)) {
    // TODO: when update is implemented
    this.wordSets.forEach(async (wordSet) => {
      const curSlug = slug(wordSet.title);
      await this.find({_id: this._id, 'wordSets.slug': curSlug});
    });
  }
});

schema.statics.hasWordSet = async function(dictionaryId, wordSetId) {
  const dict = await this.findOne({_id: dictionaryId});
  if (!dict) {
    return false;
  }

  return !!dict.wordSets.id(wordSetId);
};

mongoose.model('Dictionary', schema);
