/* global defaultUser */
const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const slug = require('slug');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  describe(`POST ${endpoints.wordsBunchAdd(':dictionaryId', ':wordSetId')}`, () => {
    it('should return 401 if auth header is not set', async () => {
      assert.equal(true, false, 'NOT IMPLEMENTED');
      // await request(app)
      //   .post(endpoints.dictionaries())
      //   // .set(...defaultUser.authData.header)
      //   .send(mocks.dictionary())
      //   .expect(401);
    });
  });
});
