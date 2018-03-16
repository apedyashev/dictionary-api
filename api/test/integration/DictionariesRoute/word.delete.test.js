/* global defaultUser */
const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  describe(`DELETE ${endpoints.dictionaryWords(':id', ':wordSetId', ':wordId')}`, () => {
    let dictionary;
    let wordToBeDeleted;
    beforeEach(async () => {
      await request(app)
        .post(endpoints.dictionaries())
        .set(...defaultUser.authData.header)
        .send(mocks.dictionary())
        .expect(201)
        .expect((res) => {
          dictionary = res.body.item;
        });

      const wordSetId = dictionary.wordSets[0].id;
      await request(app)
        .post(endpoints.dictionaryWords(dictionary.id, wordSetId))
        .set(...defaultUser.authData.header)
        .send(mocks.word())
        .expect(201)
        .expect((res) => {
          wordToBeDeleted = res.body.item;
        });
    });

    it('should return 401 if auth header is not set', async () => {
      const wordSetId = dictionary.wordSets[0].id;
      await request(app)
        .delete(endpoints.dictionaryWords(dictionary.id, wordSetId, wordToBeDeleted.id))
        .expect(401);
    });

    it('should delete a word', async () => {
      const wordSetId = dictionary.wordSets[0].id;
      await request(app)
        .delete(endpoints.dictionaryWords(dictionary.id, wordSetId, wordToBeDeleted.id))
        .set(...defaultUser.authData.header)
        .expect(200)
        .expect({
          message: 'word deleted',
        });

      // TODO: fetch words and check if it has been deleted
      // _.pullAt(newDict.wordSets, 3);
      // newDict.stats.wordSetsCount = newDict.wordSets.length;
      // await request(app)
      //   .get(endpoints.dictionaries(newDict.slug))
      //   .set(...defaultUser.authData.header)
      //   .expect(200)
      //   .expect((res) => {
      //     const {item} = res.body;
      //     assert.exists(item.createdAt, 'item.createdAt');
      //     res.body.item = _.omit(item, ['updatedAt']);
      //   })
      //   .expect({
      //     item: _.omit(newDict, ['updatedAt']),
      //   });
    });

    it('should return 403 if word doesn` belong to user', async () => {
      let newUserAuth;
      await request(app)
        .post(endpoints.register)
        .send(mocks.user())
        .expect(201)
        .expect((res) => {
          newUserAuth = ['Authorization', `Bearer ${res.body.token}`];
        });

      const wordSetId = dictionary.wordSets[0].id;
      await request(app)
        .delete(endpoints.dictionaryWords(dictionary.id, wordSetId, wordToBeDeleted.id))
        .set(...newUserAuth)
        .expect(403);
    });
  });
});
