const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  describe(`GET ${endpoints.dictionaries()}`, () => {
    const newDicts = [];
    let newUserAuth;
    before(async () => {
      await request(app)
        .post(endpoints.register)
        .send(mocks.user())
        .expect(201)
        .expect((res) => {
          newUserAuth = ['Authorization', `Bearer ${res.body.token}`];
        });

      const numOfDicts = 5;
      _.range(numOfDicts).map(async (n) => {
        const dictonary = mocks.dictionary();
        dictonary.translateDirection = `${n} ${dictonary.translateDirection}`;
        await request(app)
          .post(endpoints.dictionaries())
          .set(...newUserAuth)
          .send(dictonary)
          .expect(201)
          .expect((res) => {
            newDicts.push(res.body.item);
          });
      });
    });

    it('should return 401 if auth header is not set', async () => {
      await request(app)
        .get(endpoints.dictionaries())
        .expect(401);
    });

    it('should get all user`s dictionaries', async () => {
      await request(app)
        .get(endpoints.dictionaries())
        .set(...newUserAuth)
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.includeMembers(_.map(items, 'id'), _.map(newDicts, 'id'), 'got all ids');
        });
    });

    it('should sort result by single field (translateDirection:asc)', async () => {
      await request(app)
        .get(endpoints.dictionaries())
        .set(...newUserAuth)
        .query({sortBy: 'translateDirection:asc'})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.sameOrderedMembers(
            _.map(items, 'translateDirection'),
            _(newDicts)
              .orderBy(['translateDirection'], ['asc'])
              .map('translateDirection')
              .value(),
            'sorted by translateDirection:asc'
          );
        });
    });

    it('should sort result by single field (translateDirection:desc)', async () => {
      await request(app)
        .get(endpoints.dictionaries())
        .set(...newUserAuth)
        .query({sortBy: 'translateDirection:desc'})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.sameOrderedMembers(
            _.map(items, 'translateDirection'),
            _(newDicts)
              .orderBy(['translateDirection'], ['desc'])
              .map('translateDirection')
              .value(),
            'sorted by translateDirection:desc'
          );
        });
    });

    it('should return paginated results (page: 1, perPage: 2)', async () => {
      const perPage = 2;
      await request(app)
        .get(endpoints.dictionaries())
        .set(...newUserAuth)
        .query({sortBy: 'translateDirection:asc', page: 1, perPage})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.sameOrderedMembers(
            _.map(items, 'translateDirection'),
            _(newDicts)
              .orderBy(['translateDirection'], ['asc'])
              .map('translateDirection')
              .slice(0, 2)
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
            total: 5,
          },
        });
    });

    it('should return paginated results (page: 2, perPage: 2)', async () => {
      const perPage = 2;
      await request(app)
        .get(endpoints.dictionaries())
        .set(...newUserAuth)
        .query({sortBy: 'translateDirection:asc', page: 2, perPage})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.sameOrderedMembers(
            _.map(items, 'translateDirection'),
            _(newDicts)
              .orderBy(['translateDirection'], ['asc'])
              .map('translateDirection')
              .slice(2, 4)
              .value(),
            'returns the 2nd page'
          );

          res.body = _.omit(res.body, ['items']);
        })
        .expect({
          pagination: {
            page: 2,
            pages: 3,
            perPage,
            total: 5,
          },
        });
    });

    it('should return paginated results (page: 1, perPage: 3)', async () => {
      const perPage = 3;
      await request(app)
        .get(endpoints.dictionaries())
        .set(...newUserAuth)
        .query({sortBy: 'translateDirection:asc', page: 1, perPage})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.sameOrderedMembers(
            _.map(items, 'translateDirection'),
            _(newDicts)
              .orderBy(['translateDirection'], ['asc'])
              .map('translateDirection')
              .slice(0, 3)
              .value(),
            'returns the 1nd page out of 2'
          );

          res.body = _.omit(res.body, ['items']);
        })
        .expect({
          pagination: {
            page: 1,
            pages: 2,
            perPage,
            total: 5,
          },
        });
    });
  });
});
