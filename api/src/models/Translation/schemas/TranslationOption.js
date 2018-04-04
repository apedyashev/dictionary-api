const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');
const Schema = mongoose.Schema;

const schema = new Schema({
  text: {
    type: String,
    default: '',
  },
  examples: [String],
  meanings: [String],
  synonyms: [String],
});
schema.plugin(toJson);

module.exports = schema;
