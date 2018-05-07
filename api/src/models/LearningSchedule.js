const _ = require('lodash');
const kue = require('kue');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamp');
const toJson = require('@meanie/mongoose-to-json');
const mongoosePaginate = require('mongoose-paginate');
// const moment = require('moment');
const moment = require('moment-timezone');
const Dictionary = mongoose.model('Dictionary');

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

schema.post('find', async function(docs) {
  for (let docIdx = 0; docIdx < docs.length; docIdx++) {
    docs[docIdx].populateDictionaries();
  }
});

schema.statics.addWord = async function(word) {
  // remove word from the schedule before adding it
  const scheduleItem = await this.findOne({'dictionaries._id': word.dictionary});
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
    await newDayScheduleItem.save();

    return newDayScheduleItem;
  }
  return await this.create({
    owner: word.owner,
    date: nextReviewDate,
    dictionaries: [
      {
        _id: word.dictionary,
        words: [{_id: word._id, title: word.word}],
      },
    ],
  });
};

schema.methods.populateDictionaries = async function() {
  const {dictionaries} = this;
  for (let i = 0; i < dictionaries.length; i++) {
    const cachedDictionary = await Dictionary.findCachedById(dictionaries[i]._id);
    dictionaries[i] = {...cachedDictionary, ..._.pick(dictionaries[i], ['_id', 'words'])};
  }

  return this;
};

// TODO: config
const jobsQueue = kue.createQueue({
  redis: {
    host: 'redis',
  },
});
schema.methods.createNotificationJobs = function(user) {
  const [hours, minutes] = user.exerciseTime.split(':');
  const exerciseTimeMs = moment
    .utc(this.date)
    .tz(user.timezone)
    .set('hour', hours)
    .set('minutes', minutes);
  const nowTimeMs = moment.tz(user.timezone);
  const notificationDelay = exerciseTimeMs.valueOf() - nowTimeMs.valueOf();

  const job = jobsQueue
    .create('email', {
      to: user.email,
      firstName: user.firstName,
      dicts: this.dictionaries,
    })
    .delay(notificationDelay)
    .removeOnComplete(true)
    .save(function(err) {
      if (!err) console.log(job.id);
    });
  return this;
};

mongoose.model('LearningSchedule', schema);
