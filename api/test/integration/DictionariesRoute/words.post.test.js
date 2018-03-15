/* global defaultUser */
const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  let dictionary;
  before(async () => {
    await request(app)
      .post(endpoints.dictionaries())
      .set(...defaultUser.authData.header)
      .send(mocks.dictionary())
      .expect(201)
      .expect((res) => {
        dictionary = res.body.item;
      });
  });

  describe(`POST ${endpoints.dictionaryWords(':id', ':wordSetId')}`, () => {
    it('should return 401 if auth header is not set', async () => {
      const wordSetId = dictionary.wordSets[0].id;
      await request(app)
        .post(endpoints.dictionaryWords(dictionary.id, wordSetId))
        .send(mocks.word())
        .expect(401);
    });

    it('should return 422 if payload is empty', async () => {
      const wordSetId = dictionary.wordSets[0].id;
      await request(app)
        .post(endpoints.dictionaryWords(dictionary.id, wordSetId))
        .set(...defaultUser.authData.header)
        .expect(422)
        .expect((res) => {
          delete res.body.originalError;
        })
        .expect({
          message: 'word create error',
          validationErrors: {
            word: 'required',
            translations: 'required',
          },
        });
    });

    it('should return 201 if payload is valid', async () => {
      const wordSetId = dictionary.wordSets[0].id;
      const newWord = mocks.word();
      await request(app)
        .post(endpoints.dictionaryWords(dictionary.id, wordSetId))
        .set(...defaultUser.authData.header)
        .send(newWord)
        .expect(201)
        .expect((res) => {
          const {item} = res.body;
          assert.isArray(item.translations, 'word has translations array');
          item.translations.forEach((translation) => {
            assert.exists(translation.id, 'translation has id');
            delete translation.id;
          });
          res.body.item = _.omit(res.body.item, ['id', 'createdAt', 'updatedAt', 'owner']);
        })
        .expect({
          message: 'a word created',
          item: {
            ...newWord,
            wordSet: wordSetId,
          },
        });
    });
  });
});
