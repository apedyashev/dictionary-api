const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');
const Translation = require('./schemas/Translation');
const Schema = mongoose.Schema;

const schema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'required'],
  },
  wordSet: {
    type: Schema.Types.ObjectId,
    ref: 'WordSet',
    required: [true, 'required'],
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
  // TODO: progress fields (reading, writing, listening)
});
schema.plugin(toJson);

// http://jasonjl.me/blog/2014/10/23/adding-validation-for-embedded-objects-in-mongoose/
schema.path('translations').validate(function(translations) {
  if (!translations) {
    return false;
  } else if (translations.length === 0) {
    return false;
  }
  return true;
}, 'required');

mongoose.model('Word', schema);
