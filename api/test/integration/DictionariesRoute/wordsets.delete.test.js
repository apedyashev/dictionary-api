/* global defaultUser */
const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  describe(`DELETE ${endpoints.dictionaryWordSets(':dictionaryId', ':wordSetId')}`, () => {
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
        .delete(endpoints.dictionaryWordSets(newDict.id, newDict.wordSets[0].id))
        .expect(401);
    });

    it('should delete a wordset', async () => {
      await request(app)
        .delete(endpoints.dictionaryWordSets(newDict.id, newDict.wordSets[3].id))
        .set(...defaultUser.authData.header)
        .expect(200)
        .expect({
          message: 'wordset deleted',
        });

      _.pullAt(newDict.wordSets, 3);
      newDict.stats.wordSetsCount = newDict.wordSets.length;
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
  });
});
