const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  dictionaries: {
    type: [
      {
        words: {
          type: [{title: String}],
          default: [],
        },
      },
    ],
    default: [],
  },
});

mongoose.model('LearningSchedule', schema);
