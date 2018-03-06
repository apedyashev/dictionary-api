const {assert} = require('chai');
const mongoose = require('mongoose');
const request = require('supertest');
const mocks = require('./mocks');
const app = require('../app.js');
const {endpoints} = require('./constants.js');

const defaultUser = {
  data: mocks.user(),
  authData: {
    token: null,
    header: [],
  },
};
global.defaultUser = defaultUser;

before(async () => {
  await request(app)
    .post(endpoints.register)
    .send(defaultUser.data)
    .expect(201)
    .expect((res) => {
      assert.isObject(res.body.user, 'user key');
      assert.equal(res.body.user.email, defaultUser.data.email, 'logged user email is correct');
      defaultUser.authData.header = ['Authorization', `Bearer ${res.body.token}`];
      defaultUser.authData.token = res.body.token;

      // TODO: to boilerplate
      defaultUser.data.id = res.body.user.id;
    });
});

after((done) => {
  mongoose.connection.db.dropDatabase(done);
});
