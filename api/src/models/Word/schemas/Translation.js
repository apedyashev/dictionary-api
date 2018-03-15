const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');
const Schema = mongoose.Schema;

const schema = new Schema({
  text: String,
  pos: String,
  meanings: [String],
  synonyms: [String],
  examples: [String],
});

schema.plugin(toJson);

module.exports = schema;
