/* global defaultUser */
const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  describe(`POST ${endpoints.words()}`, () => {
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

    it('should return 401 if auth header is not set', async () => {
      const wordSetId = dictionary.wordSets[0].id;
      await request(app)
        .post(endpoints.words())
        .send(mocks.word({dictionary: dictionary.id, wordSet: wordSetId}))
        .expect(401);
    });

    it('should return 422 if payload is empty', async () => {
      await request(app)
        .post(endpoints.words())
        .set(...defaultUser.authData.header)
        .expect(422)
        .expect((res) => {
          delete res.body.originalError;
        })
        .expect({
          message: 'word create error',
          validationErrors: {
            word: 'required',
            dictionary: 'required',
            translations: 'required',
          },
        });
    });

    it('should return 201 if payload is valid', async () => {
      // get dictonary stats befire creating a new word
      let dictionaryStats;
      await request(app)
        .get(endpoints.dictionaries(dictionary.slug))
        .set(...defaultUser.authData.header)
        .expect(200)
        .expect((res) => {
          dictionaryStats = res.body.item.stats;
        });

      const wordSetId = dictionary.wordSets[0].id;
      const newWord = mocks.word({dictionary: dictionary.id, wordSet: wordSetId});
      await request(app)
        .post(endpoints.words())
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
            isLearned: false,
          },
        });

      // Check that words count has been increased
      await request(app)
        .get(endpoints.dictionaries(dictionary.slug))
        .set(...defaultUser.authData.header)
        .expect(200)
        .expect((res) => {
          assert.deepEqual(res.body.item.stats, {
            wordsCount: dictionaryStats.wordsCount + 1,
            wordSetsCount: dictionaryStats.wordSetsCount,
          });

          assert.equal(
            _.find(res.body.item.wordSets, {id: wordSetId}).stats.wordsCount,
            dictionary.wordSets[0].stats.wordsCount + 1,
            'wordSets.stats.wordsCount increased'
          );
        });
    });
  });
});
