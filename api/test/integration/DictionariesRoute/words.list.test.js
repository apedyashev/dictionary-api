const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  const userWords = [];
  let newUserAuth;
  let dictionary;
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

    for (let i = 0; i < 20; i++) {
      const wordSetId = dictionary.wordSets[_.random(wordSetsCount - 1)].id;
      await request(app)
        .post(endpoints.words())
        .set(...newUserAuth)
        .send(mocks.word({dictionary: dictionary.id, wordSet: wordSetId}))
        .expect(201)
        .expect((res) => {
          userWords.push(res.body.item);
        });
    }
  });

  describe(`GET ${endpoints.dictionaryWords(':id')}`, () => {
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
      const perPage = 5;
      await request(app)
        .get(endpoints.dictionaryWords(dictionary.id))
        .set(...newUserAuth)
        .query({sortBy: 'word:asc', page: 1, perPage})
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
            perPage,
            total: 20,
          },
        });
    });

    it('should return paginated results (page: 2, perPage: 5)', async () => {
      const perPage = 5;
      await request(app)
        .get(endpoints.dictionaryWords(dictionary.id))
        .set(...newUserAuth)
        .query({sortBy: 'word:asc', page: 2, perPage})
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
            perPage,
            total: 20,
          },
        });
    });

    it('should return paginated results (page: 1, perPage: 9)', async () => {
      const perPage = 9;
      await request(app)
        .get(endpoints.dictionaryWords(dictionary.id))
        .set(...newUserAuth)
        .query({sortBy: 'word:asc', page: 1, perPage})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.sameOrderedMembers(
            _.map(items, 'word'),
            _(userWords)
              .orderBy(['word'], ['asc'])
              .map('word')
              .slice(0, 9)
              .value(),
            'returns the first page'
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

    it('should search by whole word', async () => {
      const search = userWords[10].word;
      await request(app)
        .get(endpoints.dictionaryWords(dictionary.id))
        .set(...newUserAuth)
        .query({search})
        .expect(200)
        .expect({
          items: [userWords[10]],
          pagination: {
            page: 1,
            pages: 1,
            perPage: 30,
            total: 1,
          },
        });
    });

    it('should search by beggining of a word', async () => {
      const search = userWords[9].word.slice(0, 3);
      const expectedItems = _(userWords)
        .filter(({word}) => {
          return new RegExp(search, 'ig').test(word);
        })
        .orderBy(['word'], ['asc'])
        .value();

      await request(app)
        .get(endpoints.dictionaryWords(dictionary.id))
        .set(...newUserAuth)
        .query({search, sortBy: 'word:asc'})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.include(_.map(items, 'id'), userWords[9].id, 'result includes word ad index 9');
        })
        .expect({
          items: expectedItems,
          pagination: {
            page: 1,
            pages: 1,
            perPage: 30,
            total: expectedItems.length,
          },
        });
    });
  });

  describe(`GET ${endpoints.dictionaryWordsetWords(':id', ':wordSetId', ':wordId')}`, () => {
    it('should return 401 if auth header is not set', async () => {
      const wordSetId = dictionary.wordSets[0].id;
      await request(app)
        .get(endpoints.dictionaryWordsetWords(dictionary.id, wordSetId))
        .expect(401);
    });

    it('should return words associated with wordset', async () => {
      dictionary.wordSets.forEach(async ({id: wordSetId}) => {
        const expectedItems = _(userWords)
          .filter(({wordSet}) => {
            return wordSet === wordSetId;
          })
          .orderBy(['word'], ['asc'])
          .value();
        await request(app)
          .get(endpoints.dictionaryWordsetWords(dictionary.id, wordSetId))
          .set(...newUserAuth)
          .query({sortBy: 'word:asc'})
          .expect(200)
          .expect({
            items: expectedItems,
            pagination: {
              page: 1,
              pages: 1,
              perPage: 30,
              total: expectedItems.length,
            },
          });
      });
    });
  });
});
