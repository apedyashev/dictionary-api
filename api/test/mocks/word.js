const faker = require('faker');

module.exports = function dictonary(customFields) {
  return {
    word: faker.hacker.noun(),
    translations: [
      {
        text: faker.hacker.verb(),
        pos: faker.hacker.verb(),
        meanings: [1, 2, 3].map(() => faker.hacker.verb()),
        synonyms: [faker.hacker.verb()],
        examples: [faker.hacker.phrase()],
      },
      {
        text: faker.hacker.verb(),
        pos: faker.hacker.verb(),
        meanings: [1, 2, 3].map(() => faker.hacker.verb()),
        synonyms: [faker.hacker.verb()],
        examples: [faker.hacker.phrase()],
      },
    ],
    ...customFields,
  };
};
