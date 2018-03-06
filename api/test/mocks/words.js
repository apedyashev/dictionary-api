const faker = require('faker');
const _ = require('lodash');

module.exports = function words(count) {
  return _.range(count).map(() => ({
    word: faker.hacker.noun(),
    translation: faker.hacker.verb(),
  }));
};
