const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');
const Schema = mongoose.Schema;

const schema = new Schema({
  pos: {
    type: String,
    default: '',
  },
  translations: [
    new Schema({
      text: {
        type: String,
        default: '',
      },
      examples: [String],
      meanings: [String],
      synonyms: [String],
    }),
  ],
  transcription: {
    type: String,
    default: '',
  },
});
schema.plugin(toJson);

module.exports = schema;
