const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  describe(`GET ${endpoints.dictionaryWords(':id')}`, () => {
    const userWords = [];
    let newUserAuth;
    before(async () => {
      const wordSetsCount = 3;
      await request(app)
        .post(endpoints.register)
        .send(mocks.user())
        .expect(201)
        .expect((res) => {
          newUserAuth = ['Authorization', `Bearer ${res.body.token}`];
        });
      await request(app)
        .post(endpoints.dictionaries())
        .set(...newUserAuth)
        .send(mocks.dictionary(wordSetsCount))
        .expect(201)
        .expect((res) => {
          dictionary = res.body.item;
        });

      _.range(20).forEach(async () => {
        const wordSetId = dictionary.wordSets[_.random(wordSetsCount - 1)].id;
        await request(app)
          .post(endpoints.dictionaryWordsetWords(dictionary.id, wordSetId))
          .set(...newUserAuth)
          .send(mocks.word({dictionary: dictionary.id}))
          .expect(201)
          .expect((res) => {
            userWords.push(res.body.item);
          });
      });
    });

    it('should return 401 if auth header is not set', async () => {
      await request(app)
        .get(endpoints.dictionaryWords(dictionary.id))
        .expect(401);
    });

    it('should get all user`s words for given dictionary', async () => {
      await request(app)
        .get(endpoints.dictionaryWords(dictionary.id))
        .set(...newUserAuth)
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.includeMembers(_.map(items, 'id'), _.map(userWords, 'id'), 'got all ids');
        });
    });

    it('should sort result by single field (word:asc)', async () => {
      await request(app)
        .get(endpoints.dictionaryWords(dictionary.id))
        .set(...newUserAuth)
        .query({sortBy: 'word:asc'})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.sameOrderedMembers(
            _.map(items, 'word'),
            _(userWords)
              .orderBy(['word'], ['asc'])
              .map('word')
              .value(),
            'sorted by word:asc'
          );
        });
    });

    it('should sort result by single field (word:desc)', async () => {
      await request(app)
        .get(endpoints.dictionaryWords(dictionary.id))
        .set(...newUserAuth)
        .query({sortBy: 'word:desc'})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.sameOrderedMembers(
            _.map(items, 'word'),
            _(userWords)
              .orderBy(['word'], ['desc'])
              .map('word')
              .value(),
            'sorted by word:desc'
          );
        });
    });

    it('should return paginated results (page: 1, perPage: 5)', async () => {
      await request(app)
        .get(endpoints.dictionaryWords(dictionary.id))
        .set(...newUserAuth)
        .query({sortBy: 'word:asc', page: 1, perPage: 5})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.sameOrderedMembers(
            _.map(items, 'word'),
            _(userWords)
              .orderBy(['word'], ['asc'])
              .map('word')
              .slice(0, 5)
              .value(),
            'returns the first page'
          );

          res.body = _.omit(res.body, ['items']);
        })
        .expect({
          pagination: {
            page: 1,
            pages: 4,
            limit: 5,
            total: 20,
          },
        });
    });

    it('should return paginated results (page: 2, perPage: 5)', async () => {
      await request(app)
        .get(endpoints.dictionaryWords(dictionary.id))
        .set(...newUserAuth)
        .query({sortBy: 'word:asc', page: 2, perPage: 5})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.sameOrderedMembers(
            _.map(items, 'word'),
            _(userWords)
              .orderBy(['word'], ['asc'])
              .map('word')
              .slice(5, 10)
              .value(),
            'returns the first page'
          );

          res.body = _.omit(res.body, ['items']);
        })
        .expect({
          pagination: {
            page: 2,
            pages: 4,
            limit: 5,
            total: 20,
          },
        });
    });
  });
});
