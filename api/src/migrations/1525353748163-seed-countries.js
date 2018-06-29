const _ = require('lodash');
const countriesData = require('./seeds/countries.json');
const timezonesData = require('./seeds/timezones.json');
const config = require('../config');
const mongoose = require('dictionary-api-common/mongoose.js')(config);
require('../models')();
const Country = mongoose.model('Country');

exports.up = function(next) {
  const promises = _.map(countriesData, (countryData, code) => {
    if (!timezonesData[code]) {
      console.log('no data for', code);
    }
    if (code !== 'XK' && timezonesData[code]) {
      const country = new Country({
        name: countryData.name,
        nativeName: countryData.native,
        timezones: timezonesData[code].timezones.map((name) => ({name})),
      });
      return country.save();
    }
  });
  Promise.all(promises)
    .then(() => next())
    .catch(next);
};

exports.down = function(next) {
  Country.collection.drop(next);
};
