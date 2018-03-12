const faker = require('faker');

module.exports = function dictonary(customFields) {
  return {
    title: faker.hacker.phrase(),
    ...customFields,
  };
};
