const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');
const Schema = mongoose.Schema;

const schema = new Schema({
  title: {
    type: String,
    required: [true, 'required'],
  },
  wordsCount: {
    type: Number,
    default: 0,
  },
});
schema.plugin(toJson);

module.exports = schema;
