const _ = require('lodash');
const countriesData = require('./seeds/countries.json');
const mongoose = require('../../mongoose.js')();
const Country = mongoose.model('Country');

exports.up = function(next) {
  const promises = _.map(countriesData, (countryData) => {
    const country = new Country({
      name: countryData.name,
      nativeName: countryData.native,
    });
    return country.save();
  });
  Promise.all(promises)
    .then(() => next())
    .catch(next);
};

exports.down = function(next) {
  Country.collection.drop(next);
};
