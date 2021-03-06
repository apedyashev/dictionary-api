/* global defaultUser */
const {assert} = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');
const _ = require('lodash');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  describe(`GET ${endpoints.dictionaries(':id')}`, () => {
    let newDict;
    beforeEach(async () => {
      const dictonary = mocks.dictionary(5);
      await request(app)
        .post(endpoints.dictionaries())
        .set(...defaultUser.authData.header)
        .send(dictonary)
        .expect(201)
        .expect((res) => {
          newDict = res.body.item;
        });
    });

    it('should return 401 if auth header is not set', async () => {
      await request(app)
        .get(endpoints.dictionaries(newDict.id))
        .expect(401);
    });

    it('should get a dictionary', async () => {
      await request(app)
        .get(endpoints.dictionaries(newDict.id))
        .set(...defaultUser.authData.header)
        .expect(200)
        .expect((res) => {
          const {item} = res.body;
          assert.exists(item.createdAt, 'item.createdAt');
          res.body.item = _.omit(item, ['updatedAt']);
        })
        .expect({
          item: _.omit(newDict, ['updatedAt']),
        });
    });

    it('should return 404 if ID is fake', async () => {
      await request(app)
        .get(endpoints.dictionaries(mongoose.Types.ObjectId()))
        .set(...defaultUser.authData.header)
        .expect(404);
    });
  });
});
