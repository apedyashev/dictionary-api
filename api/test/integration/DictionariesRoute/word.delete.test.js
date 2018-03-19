/* global defaultUser */
const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  describe(`DELETE ${endpoints.dictionaryWordsetWords(':id', ':wordSetId', ':wordId')}`, () => {
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
        .post(endpoints.dictionaryWordsetWords(dictionary.id, wordSetId))
        .set(...defaultUser.authData.header)
        .send(mocks.word({dictionary: dictionary.id}))
        .expect(201)
        .expect((res) => {
          wordToBeDeleted = res.body.item;
        });
    });

    it('should return 401 if auth header is not set', async () => {
      const wordSetId = dictionary.wordSets[0].id;
      await request(app)
        .delete(endpoints.dictionaryWordsetWords(dictionary.id, wordSetId, wordToBeDeleted.id))
        .expect(401);
    });

    it('should delete a word', async () => {
      const wordSetId = dictionary.wordSets[0].id;
      await request(app)
        .delete(endpoints.dictionaryWordsetWords(dictionary.id, wordSetId, wordToBeDeleted.id))
        .set(...defaultUser.authData.header)
        .expect(200)
        .expect({
          message: 'word deleted',
        });

      await request(app)
        .get(endpoints.dictionaryWords(dictionary.id))
        .set(...defaultUser.authData.header)
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.notInclude(
            _.map(items, 'id'),
            wordToBeDeleted.id,
            'deleted word ID is absent in the GET response'
          );
        });
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
        .delete(endpoints.dictionaryWordsetWords(dictionary.id, wordSetId, wordToBeDeleted.id))
        .set(...newUserAuth)
        .expect(403);
    });
  });
});
