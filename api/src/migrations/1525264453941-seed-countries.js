const _ = require('lodash');
const countriesData = require('./seeds/countries.json');
const citiesData = require('./seeds/cities.json');
const mongoose = require('../../mongoose.js')();
const Country = mongoose.model('Country');

exports.up = function(next) {
  const promises = _.map(countriesData, (countryData, code) => {
    if (code !== 'XK') {
      const countryCities = _.filter(citiesData, (city) => {
        return (
          (code.toLowerCase() === 'rs' && city.country.toLowerCase() === 'kosovo') ||
          String(city.iso2).toLowerCase() === code.toLowerCase()
        );
      });
      const country = new Country({
        name: countryData.name,
        nativeName: countryData.native,
        cities: countryCities.map((city) => ({...city, name: city.city})),
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
