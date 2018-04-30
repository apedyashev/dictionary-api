const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;
const toJson = require('@meanie/mongoose-to-json');
const moment = require('moment');

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

schema.statics.addWord = async function(word) {
  // remove word from the schedule before adding it
  // NOTE: each word can be added to the schedule ONCE, so use findOne
  const scheduleItem = await this.findOne({'words._id': word._id});
  console.log('scheduleItem', scheduleItem);
  if (scheduleItem) {
    scheduleItem.words.pull(word._id);
    await scheduleItem.save();
  }

  // add to the schedule
  const nextReviewDate = moment()
    .startOf('day')
    .add(word.reviewInDays, 'days')
    .toDate();
  const newScheduleDayItem = await this.findOne({
    owner: word.owner,
    date: nextReviewDate,
  });
  if (newScheduleDayItem) {
    // add word to existing schedule item
    newScheduleDayItem.words.push({_id: word._id, title: word.word});
    await newScheduleDayItem.save();
  } else {
    await this.create({
      owner: word.owner,
      date: nextReviewDate,
      words: [{_id: word._id, title: word.word}],
    });
  }
};

mongoose.model('LearningSchedule', schema);
