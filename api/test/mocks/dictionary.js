const faker = require('faker');
const _ = require('lodash');

module.exports = function dictonary(wordSetsCount = 3) {
  return {
    title: faker.hacker.phrase(),
    translateFrom: faker.hacker.noun(),
    translateTo: faker.hacker.noun(),
    wordSets: _.range(wordSetsCount).map(() => ({
      title: faker.hacker.phrase(),
    })),
  };
};
