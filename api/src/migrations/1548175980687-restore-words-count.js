const config = require('../config');
const mongoose = require('dictionary-api-common/mongoose.js')(config);
require('../models')();
const Word = mongoose.model('Word');
const Dictionary = mongoose.model('Dictionary');

exports.up = async function(next) {
  try {
    const dictionaries = await Dictionary.find();
    if (dictionaries) {
      for (let i = 0; i < dictionaries.length; i++) {
        const dict = dictionaries[i];
        // words count
        const wordsCount = await Word.count({dictionary: dict._id});
        // words to be learned count
        const learnedWordsCount = await Word.count({dictionary: dict._id, isLearned: true});

        // use update insted of save() since presave hook overrides stats object
        await Dictionary.update(
          {_id: dict._id},
          {$set: {'stats.wordsCount': wordsCount, 'stats.learnedWordsCount': learnedWordsCount}}
        );
      }
    }

    next();
  } catch (e) {
    console.log(e);
    next(e);
  }
};

exports.down = function(next) {
  next();
};
