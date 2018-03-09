/* global defaultUser */
const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const slug = require('slug');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionarie Route', () => {
  describe(`POST ${endpoints.dictionaries}`, () => {
    it('should return 401 if auth header is not set', async () => {
      await request(app)
        .post(endpoints.dictionaries)
        // .set(...defaultUser.authData.header)
        .send(mocks.dictionary())
        .expect(401);
    });

    it('should return 201 and created dictionary if header and payload are valid', async () => {
      const dictonary = mocks.dictionary();
      await request(app)
        .post(endpoints.dictionaries)
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
      dictonary.wordSets[2].title = dictonary.wordSets[0].title;
      dictonary.wordSets[4].title = dictonary.wordSets[0].title;
      dictonary.wordSets[3].title = dictonary.wordSets[1].title;
      await request(app)
        .post(endpoints.dictionaries)
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
        .post(endpoints.dictionaries)
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
  });

  // describe(`GET ${endpoints.dictionaries}`, () => {
  //   it('should return 200 and user`s dictionaries', async () => {
  //     const dictonary = mocks.dictionary();
  //     await request(app)
  //       .get(endpoints.dictionaries)
  //       .set(...defaultUser.authData.header)
  //       .expect(200)
  //       .expect({});
  //   });
  // });
});
