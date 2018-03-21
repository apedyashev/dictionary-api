/* global defaultUser */
const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const slug = require('slug');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  describe(`POST ${endpoints.dictionaryWordSets(':id')}`, () => {
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
        .post(endpoints.dictionaryWordSets(newDict.id))
        .expect(401);
    });

    it('should return 422 if payload is empty', async () => {
      await request(app)
        .post(endpoints.dictionaryWordSets(newDict.id))
        .set(...defaultUser.authData.header)
        .expect(422)
        .expect((res) => {
          delete res.body.originalError;
        })
        .expect({
          message: 'wordset create error',
          validationErrors: {
            'wordSets.5.title': 'required',
          },
        });
    });

    it('should create a new wordset', async () => {
      const newWordSet = mocks.wordSet();
      await request(app)
        .post(endpoints.dictionaryWordSets(newDict.id))
        .set(...defaultUser.authData.header)
        .send(newWordSet)
        .expect(201)
        .expect((res) => {
          const {item} = res.body;
          assert.exists(item.id, 'item.id');
          res.body.item = _.omit(item, ['id']);
        })
        .expect({
          message: 'wordset created',
          item: {
            ...newWordSet,
            slug: slug(newWordSet.title),
            stats: {
              wordsCount: 0,
            },
          },
        });
    });
  });
});
