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
        dictonary.translateFrom = `${n} ${dictonary.translateFrom}`;
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

    it('should sort result by single field (translateFrom:asc)', async () => {
      await request(app)
        .get(endpoints.dictionaries())
        .set(...newUserAuth)
        .query({sortBy: 'translateFrom:asc'})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.sameOrderedMembers(
            _.map(items, 'translateFrom'),
            _(newDicts)
              .orderBy(['translateFrom'], ['asc'])
              .map('translateFrom')
              .value(),
            'sorted by translateFrom:asc'
          );
        });
    });

    it('should sort result by single field (translateFrom:desc)', async () => {
      await request(app)
        .get(endpoints.dictionaries())
        .set(...newUserAuth)
        .query({sortBy: 'translateFrom:desc'})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.sameOrderedMembers(
            _.map(items, 'translateFrom'),
            _(newDicts)
              .orderBy(['translateFrom'], ['desc'])
              .map('translateFrom')
              .value(),
            'sorted by translateFrom:desc'
          );
        });
    });

    it('should return paginated results (page: 1, perPage: 2)', async () => {
      await request(app)
        .get(endpoints.dictionaries())
        .set(...newUserAuth)
        .query({sortBy: 'translateFrom:asc', page: 1, perPage: 2})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.sameOrderedMembers(
            _.map(items, 'translateFrom'),
            _(newDicts)
              .orderBy(['translateFrom'], ['asc'])
              .map('translateFrom')
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
            limit: 2,
            total: 5,
          },
        });
    });

    it('should return paginated results (page: 2, perPage: 2)', async () => {
      await request(app)
        .get(endpoints.dictionaries())
        .set(...newUserAuth)
        .query({sortBy: 'translateFrom:asc', page: 2, perPage: 2})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.sameOrderedMembers(
            _.map(items, 'translateFrom'),
            _(newDicts)
              .orderBy(['translateFrom'], ['asc'])
              .map('translateFrom')
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
            limit: 2,
            total: 5,
          },
        });
    });

    it('should return paginated results (page: 1, perPage: 3)', async () => {
      await request(app)
        .get(endpoints.dictionaries())
        .set(...newUserAuth)
        .query({sortBy: 'translateFrom:asc', page: 1, perPage: 3})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.sameOrderedMembers(
            _.map(items, 'translateFrom'),
            _(newDicts)
              .orderBy(['translateFrom'], ['asc'])
              .map('translateFrom')
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
            limit: 3,
            total: 5,
          },
        });
    });
  });
});
