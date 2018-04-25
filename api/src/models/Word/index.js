const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');
const mongoosePaginate = require('mongoose-paginate');
const timestamps = require('mongoose-timestamp');
const Translation = require('./schemas/Translation');
const Schema = mongoose.Schema;

/**
 * @swagger
 * definitions:
 *   SerializedWord:
 *     allOf:
 *       - $ref: '#/definitions/BaseModel'
 *       - properties:
 *          owner:
 *            type: string
 *          dictionary:
 *            type: string
 *          wordSet:
 *            type: string
 *          word:
 *            type: string
 *          translations:
 *            type: array
 *            items:
 *              $ref: "#/definitions/SerializedTranslation"
 *          isLearned:
 *            type: boolean
 */
const schema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'required'],
  },
  dictionary: {
    type: Schema.Types.ObjectId,
    ref: 'Dictionary',
    required: [true, 'required'],
  },
  wordSet: {
    type: Schema.Types.ObjectId,
    ref: 'WordSet',
    default: null,
  },
  word: {
    type: String,
    required: [true, 'required'],
  },
  translations: {
    type: [Translation],
  },
  isLearned: {
    type: Boolean,
    default: false,
  },
  learnedAt: {
    type: Date,
  },
  reviewInDays: {
    type: Number,
    default: 0,
  },
  learnedStatus: {
    wordTranslation: {
      type: Boolean,
      default: false,
    },
    writing: {
      type: Boolean,
      default: false,
    },
    translationWord: {
      type: Boolean,
      default: false,
    },
  },
});
schema.plugin(timestamps);
schema.plugin(toJson);
schema.plugin(mongoosePaginate);

// http://jasonjl.me/blog/2014/10/23/adding-validation-for-embedded-objects-in-mongoose/
schema.path('translations').validate(function(translations) {
  if (!translations) {
    return false;
  } else if (translations.length === 0) {
    return false;
  }
  return true;
}, 'required');

schema.pre('save', function(next) {
  const {wordTranslation, writing, translationWord} = this.learnedStatus;
  // const prevIsLearned = this.isLearned;
  this.isLearned = wordTranslation && writing && translationWord;
  // if (!prevIsLearned && this.isLearned) {
  //   this.learnedAt = new Date();
  //   this.reviewInDays = 2 * this.reviewInDays + 1;
  // }
  next();
});

mongoose.model('Word', schema);
