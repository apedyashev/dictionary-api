const faker = require('faker');

module.exports = function dictonary(customFields) {
  return {
    word: faker.hacker.noun(),
    translation: faker.hacker.verb(),
  };
};
