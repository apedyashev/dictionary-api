const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;
const toJson = require('@meanie/mongoose-to-json');

const schema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'required'],
  },
  date: {
    type: Date,
    required: [true, 'required'],
  },
  words: {
    type: [{title: String}],
    default: [],
  },
});
schema.plugin(timestamps);
schema.plugin(toJson);

mongoose.model('LearningSchedule', schema);
