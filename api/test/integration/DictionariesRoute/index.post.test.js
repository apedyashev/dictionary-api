/* global defaultUser */
const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const slug = require('slug');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  describe(`POST ${endpoints.dictionaries()}`, () => {
    it('should return 401 if auth header is not set', async () => {
      await request(app)
        .post(endpoints.dictionaries())
        // .set(...defaultUser.authData.header)
        .send(mocks.dictionary())
        .expect(401);
    });

    it('should return 422 if payload is invalid', async () => {
      const dictonary = mocks.dictionary();
      await request(app)
        .post(endpoints.dictionaries())
        .set(...defaultUser.authData.header)
        .expect(422)
        .expect((res) => {
          delete res.body.originalError;
        })
        .expect({
          message: 'dictionary create error',
          validationErrors: {
            title: 'required',
            translateFrom: 'required',
            translateTo: 'required',
          },
        });
    });

    it('should return 201 and created dictionary if header and payload are valid', async () => {
      const dictonary = mocks.dictionary();
      await request(app)
        .post(endpoints.dictionaries())
        .set(...defaultUser.authData.header)
        .send(dictonary)
        .expect(201)
        .expect((res) => {
          const {item} = res.body;
          assert.exists(item.id, 'item.id');
          assert.exists(item.createdAt, 'item.createdAt');
          assert.exists(item.updatedAt, 'item.updatedAt');
          item.wordSets.forEach((wordSet) => {
            assert.exists(wordSet.id, `wordSet.id`);
            delete wordSet.id;
          });
          res.body.item = _.omit(item, ['id', 'createdAt', 'updatedAt']);
        })
        .expect({
          message: 'dictonary created',
          item: {
            ...dictonary,
            owner: defaultUser.data.id,
            slug: slug([dictonary.translateFrom, dictonary.translateTo].join(' ')),
            collaborators: [],
            wordSets: dictonary.wordSets.map((wordSet) => ({
              ...wordSet,
              slug: slug(wordSet.title),
              stats: {wordsCount: 0},
            })),
            stats: {
              wordSetsCount: dictonary.wordSets.length,
              wordsCount: 0,
            },
          },
        });
    });

    it('should append incremented number to slug if such slug is already exist', async () => {
      const dictonary = mocks.dictionary(5);
      // make some of titles the same
      dictonary.wordSets[2].title = dictonary.wordSets[0].title;
      dictonary.wordSets[4].title = dictonary.wordSets[0].title;
      dictonary.wordSets[3].title = dictonary.wordSets[1].title;
      await request(app)
        .post(endpoints.dictionaries())
        .set(...defaultUser.authData.header)
        .send(dictonary)
        .expect(201)
        .expect((res) => {
          const {item: {wordSets}} = res.body;
          const expectedSlugs = _(dictonary.wordSets)
            .map('title')
            .map((title) => slug(title))
            .value();
          expectedSlugs[2] = `${expectedSlugs[0]}-1`;
          expectedSlugs[4] = `${expectedSlugs[0]}-2`;
          expectedSlugs[3] = `${expectedSlugs[1]}-1`;
          const allSlugs = _.map(wordSets, 'slug');
          assert.includeMembers(allSlugs, expectedSlugs, 'slugs are autoincremented');
        });
    });

    it('should set wordSets to empty array if it is missing', async () => {
      const dictonary = mocks.dictionary();
      delete dictonary.wordSets;
      await request(app)
        .post(endpoints.dictionaries())
        .set(...defaultUser.authData.header)
        .send(dictonary)
        .expect(201)
        .expect((res) => {
          const {item} = res.body;
          res.body.item = _.omit(item, ['id', 'createdAt', 'updatedAt']);
        })
        .expect({
          message: 'dictonary created',
          item: {
            ...dictonary,
            owner: defaultUser.data.id,
            slug: slug([dictonary.translateFrom, dictonary.translateTo].join(' ')),
            collaborators: [],
            wordSets: [],
            stats: {
              wordSetsCount: 0,
              wordsCount: 0,
            },
          },
        });
    });

    it('should make slug unique', async () => {
      const dictonary = mocks.dictionary();
      let firstSlug;
      await request(app)
        .post(endpoints.dictionaries())
        .set(...defaultUser.authData.header)
        .send(dictonary)
        .expect(201)
        .expect((res) => {
          firstSlug = res.body.item.slug;
        });

      // send the same data and ensure that slug is different
      await request(app)
        .post(endpoints.dictionaries())
        .set(...defaultUser.authData.header)
        .send(dictonary)
        .expect(201)
        .expect((res) => {
          assert.equal(res.body.item.slug, `${firstSlug}-2`);
        });

      // ensure that slug will be unique for a new users
      let newUserAuth;
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
        .send(dictonary)
        .expect(201)
        .expect((res) => {
          assert.equal(res.body.item.slug, `${firstSlug}-3`);
        });
    });
  });
});
