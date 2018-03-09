const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');
const Schema = mongoose.Schema;

const schema = new Schema({
  title: {
    type: String,
    required: [true, 'required'],
  },
  slug: {
    type: String,
  },
  // for the sake of performance store count instead of calculating it using aggregation
  stats: {
    wordsCount: {
      type: Number,
      default: 0,
    },
  },
});
schema.plugin(toJson);

module.exports = schema;
