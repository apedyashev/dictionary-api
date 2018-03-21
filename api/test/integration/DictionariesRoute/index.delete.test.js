/* global defaultUser */
const {assert} = require('chai');
const request = require('supertest');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  describe(`DELETE ${endpoints.dictionaries(':id')}`, () => {
    let dictionary;
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
        .expect(201);
    });

    it('should return 401 if auth header is not set', async () => {
      await request(app)
        .delete(endpoints.dictionaries(dictionary.id))
        .expect(401);
    });

    it('should delete the dictionary and associated words', async () => {
      await request(app)
        .delete(endpoints.dictionaries(dictionary.id))
        .set(...defaultUser.authData.header)
        .expect(200)
        .expect({
          message: 'dictionary deleted',
        });

      await request(app)
        .get(endpoints.dictionaryWords(dictionary.id))
        .set(...defaultUser.authData.header)
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.lengthOf(items, 0, 'dictionary`s words have been removed');
        });
    });

    it('should return 403 if dictionary doesn` belong to user', async () => {
      let newUserAuth;
      await request(app)
        .post(endpoints.register)
        .send(mocks.user())
        .expect(201)
        .expect((res) => {
          newUserAuth = ['Authorization', `Bearer ${res.body.token}`];
        });

      await request(app)
        .delete(endpoints.dictionaries(dictionary.id))
        .set(...newUserAuth)
        .expect(403);
    });
  });
});
