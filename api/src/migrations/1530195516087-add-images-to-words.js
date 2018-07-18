const config = require('../config');
const mongoose = require('dictionary-api-common/mongoose.js')(config);
require('../models')();
const Word = mongoose.model('Word');
const got = require('got');

exports.up = async function(next) {
  try {
    const words = await Word.find({image: {$exists: false}});
    if (words) {
      for (let i = 0; i < words.length; i++) {
        try {
          const word = words[i];
          const imagesResponse = await got(
            `https://api.qwant.com/api/search/images?count=1&offset=1&q=${word.word}`
          );
          const imagesData = JSON.parse(imagesResponse.body).data.result.items;
          word.image = imagesData && imagesData[0] ? imagesData[0].media : '';
          await word.save();
          console.log('word', word.id, 'saved');
        } catch (err) {
          // don't faile all the migration if one image failed
          console.log('picture getting error', err);
        }
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
