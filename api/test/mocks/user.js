const faker = require('faker');

module.exports = function user(customFields) {
  const password = faker.internet.password();
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.exampleEmail(),
    password,
    passwordConfirmation: password,
    ...customFields,
  };
};
