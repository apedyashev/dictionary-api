/* global defaultUser */
const request = require('supertest');
const slug = require('slug');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  describe(`PATCH ${endpoints.dictionaryWordSets(':dictionaryId', ':wordSetId')}`, () => {
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
        .patch(endpoints.dictionaryWordSets(newDict.id, newDict.wordSets[0].id))
        .send({...newDict.wordSets[0], ...mocks.wordSet()})
        .expect(401);
    });

    it('should update wordset`s allowed fields and make slug unique (1)', async () => {
      // title of the 5st item will be udated
      const wordSet = newDict.wordSets[4];
      wordSet.title = newDict.wordSets[0].title;

      await request(app)
        .patch(endpoints.dictionaryWordSets(newDict.id, wordSet.id))
        .set(...defaultUser.authData.header)
        .send(wordSet)
        .expect(200)
        .expect({
          message: 'word set updated',
          item: {...wordSet, slug: `${slug(wordSet.title).toLowerCase()}-1`},
        });
    });

    it('should update wordset`s allowed fields and make slug unique (2)', async () => {
      // // title of the 1st item will be udated
      const wordSet = newDict.wordSets[0];
      wordSet.title = newDict.wordSets[4].title;

      await request(app)
        .patch(endpoints.dictionaryWordSets(newDict.id, wordSet.id))
        .set(...defaultUser.authData.header)
        .send(wordSet)
        .expect(200)
        .expect({
          message: 'word set updated',
          item: {...wordSet, slug: `${slug(wordSet.title.toLowerCase())}-1`},
        });
    });
  });
});
