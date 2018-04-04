const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');
const TranslationOption = require('./TranslationOption');
const Schema = mongoose.Schema;

const schema = new Schema({
  pos: {
    type: String,
    default: '',
  },
  translations: [TranslationOption],
  transcription: {
    type: String,
    default: '',
  },
});
schema.plugin(toJson);

module.exports = schema;
