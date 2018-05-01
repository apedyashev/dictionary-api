const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamp');
const toJson = require('@meanie/mongoose-to-json');
const mongoosePaginate = require('mongoose-paginate');
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
  // words: {
  //   type: [{title: String}],
  //   default: [],
  // },
  dictionaries: {
    type: [
      {
        //_id: ObjectId, - must be _id of existing dictionary
        words: {
          type: [
            {
              //_id: ObjectId, - must be _id of existing word
              title: String,
            },
          ],
          default: [],
        },
      },
    ],
    default: [],
  },
});
schema.plugin(timestamps);
schema.plugin(toJson);
schema.plugin(mongoosePaginate);

schema.statics.addWord = async function(word) {
  // remove word from the schedule before adding it
  // NOTE: each word can be added to the schedule ONCE, so use findOne
  const scheduleItem = await this.findOne({'dictionaries._id': word.dictionary});
  console.log('scheduleItem', scheduleItem);
  if (scheduleItem) {
    scheduleItem.dictionaries.id(word.dictionary).words.pull(word._id);
    await scheduleItem.save();
  }

  // add to the schedule
  const nextReviewDate = moment()
    .startOf('day')
    .add(word.reviewInDays, 'days')
    .toDate();
  const newDayScheduleItem = await this.findOne({
    owner: word.owner,
    date: nextReviewDate,
  });
  if (newDayScheduleItem) {
    // add word to existing schedule item
    const dictionaryItem = newDayScheduleItem.dictionaries.id(word.dictionary);
    if (dictionaryItem) {
      dictionaryItem.words.push({_id: word._id, title: word.word});
    } else {
      newDayScheduleItem.dictionaries.push({
        _id: word.dictionary,
        words: [{_id: word._id, title: word.word}],
      });
    }
    // newDayScheduleItem.words.push({_id: word._id, title: word.word});
    await newDayScheduleItem.save();
  } else {
    await this.create({
      owner: word.owner,
      date: nextReviewDate,
      dictionaries: [
        {
          _id: word.dictionary,
          words: [{_id: word._id, title: word.word}],
        },
      ],
    });
  }
};

// schema.statics.addWord = async function(word) {
//   // remove word from the schedule before adding it
//   // NOTE: each word can be added to the schedule ONCE, so use findOne
//   const scheduleItem = await this.findOne({'words._id': word._id});
//   console.log('scheduleItem', scheduleItem);
//   if (scheduleItem) {
//     scheduleItem.words.pull(word._id);
//     await scheduleItem.save();
//   }
//
//   // add to the schedule
//   const nextReviewDate = moment()
//     .startOf('day')
//     .add(word.reviewInDays, 'days')
//     .toDate();
//   const newScheduleDayItem = await this.findOne({
//     owner: word.owner,
//     date: nextReviewDate,
//   });
//   if (newScheduleDayItem) {
//     // add word to existing schedule item
//     newScheduleDayItem.words.push({_id: word._id, title: word.word});
//     await newScheduleDayItem.save();
//   } else {
//     await this.create({
//       owner: word.owner,
//       date: nextReviewDate,
//       words: [{_id: word._id, title: word.word}],
//     });
//   }
// };

mongoose.model('LearningSchedule', schema);
