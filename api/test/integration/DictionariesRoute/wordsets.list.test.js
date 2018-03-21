const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  describe(`GET ${endpoints.dictionaryWordSets(':id')}`, () => {
    before(async () => {
      const wordSetsCount = 20;
      await request(app)
        .post(endpoints.dictionaries())
        .set(...defaultUser.authData.header)
        .send(mocks.dictionary(wordSetsCount))
        .expect(201)
        .expect((res) => {
          dictionary = res.body.item;
        });
    });

    it('should return paginated results (page: 1, perPage: 5)', async () => {
      const perPage = 5;
      await request(app)
        .get(endpoints.dictionaryWordSets(dictionary.id))
        .set(...defaultUser.authData.header)
        .query({sortBy: 'title:asc', page: 1, perPage})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.sameOrderedMembers(
            _.map(items, 'title'),
            _(dictionary.wordSets)
              .orderBy(['title'], ['asc'])
              .map('title')
              .slice(0, perPage)
              .value(),
            'returns the first page'
          );
          res.body = _.omit(res.body, ['items']);
        })
        .expect({
          pagination: {
            page: 1,
            pages: 4,
            perPage,
            total: 20,
          },
        });
    });

    it('should return paginated results (page: 2, perPage: 5)', async () => {
      const perPage = 5;
      await request(app)
        .get(endpoints.dictionaryWordSets(dictionary.id))
        .set(...defaultUser.authData.header)
        .query({sortBy: 'title:asc', page: 2, perPage})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.sameOrderedMembers(
            _.map(items, 'title'),
            _(dictionary.wordSets)
              .orderBy(['title'], ['asc'])
              .map('title')
              .slice(5, 10)
              .value(),
            'returns the 2nd page'
          );
          res.body = _.omit(res.body, ['items']);
        })
        .expect({
          pagination: {
            page: 2,
            pages: 4,
            perPage,
            total: 20,
          },
        });
    });

    it('should return paginated results (page: 1, perPage: 9)', async () => {
      const perPage = 9;
      await request(app)
        .get(endpoints.dictionaryWordSets(dictionary.id))
        .set(...defaultUser.authData.header)
        .query({sortBy: 'title:asc', page: 1, perPage})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.sameOrderedMembers(
            _.map(items, 'title'),
            _(dictionary.wordSets)
              .orderBy(['title'], ['asc'])
              .map('title')
              .slice(0, perPage)
              .value(),
            'returns the 1st page'
          );
          res.body = _.omit(res.body, ['items']);
        })
        .expect({
          pagination: {
            page: 1,
            pages: 3,
            perPage,
            total: 20,
          },
        });
    });
  });
});
