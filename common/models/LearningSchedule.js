const _ = require('lodash');
const kue = require('kue');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamp');
const toJson = require('@meanie/mongoose-to-json');
const mongoosePaginate = require('mongoose-paginate');
const moment = require('moment-timezone');
const DictionarySchema = require('./Dictionary');
const Dictionary = mongoose.model('Dictionary', DictionarySchema);
const UserSchema = require('./User');
const User = mongoose.model('User', UserSchema);

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
  jobId: {
    type: Number,
  },
});
schema.plugin(timestamps);
schema.plugin(toJson);
schema.plugin(mongoosePaginate);

schema.post('find', async function(docs) {
  for (let docIdx = 0; docIdx < docs.length; docIdx++) {
    await docs[docIdx].populateDictionaries();
  }
});

schema.post('findOne', async function(doc) {
  if (doc) {
    await doc.populateDictionaries();
  }
});

schema.pre('remove', async function() {
  if (!this.jobId) {
    return;
  }

  kue.Job.get(this.jobId, function(err, job) {
    job.remove(function(err) {
      if (err) throw err;
      console.log('removed completed job #%d', job.id);
    });
  });
});

schema.statics.addWord = async function(word) {
  // remove word from the schedule before adding it
  // NOTE: each word can be added to the schedule ONCE, so use findOne
  const scheduleItem = await this.findOne({'dictionaries.words._id': word._id});
  if (scheduleItem) {
    scheduleItem.dictionaries.id(word.dictionary).words.pull(word._id);
    const words = scheduleItem.dictionaries.id(word.dictionary).words;
    if (words.length) {
      await scheduleItem.save();
    } else {
      // remove dictionary without words
      scheduleItem.dictionaries.pull(word.dictionary);
      if (scheduleItem.dictionaries.length) {
        await scheduleItem.save();
      } else {
        // schedule item is empty - remove it and it's jobs
        await scheduleItem.remove();
      }
    }
  }

  // add to the schedule
  const nextReviewDate = moment()
    .startOf('day')
    .add(word.reviewInDays, 'days')
    .toDate();
  let newDayScheduleItem = await this.findOne({
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
  } else {
    newDayScheduleItem = await this.create({
      owner: word.owner,
      date: nextReviewDate,
      dictionaries: [
        {
          _id: word.dictionary,
          words: [{_id: word._id, title: word.word}],
        },
      ],
    });
    await newDayScheduleItem.createNotificationJobs(word.owner);
  }

  return newDayScheduleItem;
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
schema.methods.createNotificationJobs = async function(userId) {
  // const User = mongoose.model('User');
  const user = await User.findOne({_id: userId});

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
      scheduleItemId: this._id,
      // firstName: user.firstName,
      // dicts: this.dictionaries,
    })
    .delay(notificationDelay)
    .removeOnComplete(true)
    .save((err) => {
      // TODO
      if (!err) {
        this.jobId = job.id;
        this.save();
      }
    });
  return this;
};

module.exports = schema;
// mongoose.model('LearningSchedule', schema);
