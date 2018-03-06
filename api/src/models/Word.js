const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');
const Schema = mongoose.Schema;

const schema = new Schema({
  word: {
    type: String,
    required: [true, 'required'],
  },
  translation: {
    type: String,
    required: [true, 'required'],
  },
  // TODO: progress fields (reading, writing, listening)
});
schema.plugin(toJson);

mongoose.model('Word', schema);
