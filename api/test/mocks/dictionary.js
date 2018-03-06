const faker = require('faker');

module.exports = function dictonary(customFields) {
  return {
    translateFrom: faker.hacker.noun(),
    translateTo: faker.hacker.noun(),
    wordSets: [1, 2, 3].map(() => ({
      title: faker.hacker.phrase(),
      wordsCount: 0,
      // items: [1, 2, 3, 4, 5].map(() => ({
      //   word: faker.hacker.noun(),
      //   translation: faker.hacker.verb(),
      // })),
    })),
  };
};
