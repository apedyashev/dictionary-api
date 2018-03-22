/* global defaultUser */
const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  describe(`DELETE ${endpoints.words(':id')}`, () => {
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
        .post(endpoints.words())
        .set(...defaultUser.authData.header)
        .send(mocks.word({dictionary: dictionary.id, wordSet: wordSetId}))
        .expect(201)
        .expect((res) => {
          wordToBeDeleted = res.body.item;
        });
    });

    it('should return 401 if auth header is not set', async () => {
      await request(app)
        .delete(endpoints.words(wordToBeDeleted.id))
        .expect(401);
    });

    it('should delete a word', async () => {
      // get dictonary stats befire deleting a new word
      let dictionaryBeforeDelete;

      await request(app)
        .get(endpoints.dictionaries(dictionary.id))
        .set(...defaultUser.authData.header)
        .expect(200)
        .expect((res) => {
          dictionaryBeforeDelete = res.body.item;
        });

      const wordSetId = dictionary.wordSets[0].id;
      await request(app)
        .delete(endpoints.words(wordToBeDeleted.id))
        .set(...defaultUser.authData.header)
        .expect(200)
        .expect({
          message: 'word deleted',
        });

      // check that the word isn't returned by the GET response
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

      // Check that words count has been decreased
      await request(app)
        .get(endpoints.dictionaries(dictionary.id))
        .set(...defaultUser.authData.header)
        .expect(200)
        .expect((res) => {
          assert.deepEqual(res.body.item.stats, {
            wordsCount: dictionaryBeforeDelete.stats.wordsCount - 1,
            wordSetsCount: dictionaryBeforeDelete.stats.wordSetsCount,
          });

          assert.equal(
            _.find(res.body.item.wordSets, {id: wordSetId}).stats.wordsCount,
            _.find(dictionaryBeforeDelete.wordSets, {id: wordSetId}).stats.wordsCount - 1,
            'wordSets.stats.wordsCount increased'
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

      await request(app)
        .delete(endpoints.words(wordToBeDeleted.id))
        .set(...newUserAuth)
        .expect(403);
    });
  });
});
