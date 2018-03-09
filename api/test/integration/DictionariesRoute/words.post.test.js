/* global defaultUser */
const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionarie Route', () => {
  let dictionary;
  before(async () => {
    await request(app)
      .post(endpoints.dictionaries)
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

    // it('should set wordSets to empty array if it is missing', async () => {
    //   const dictonary = mocks.dictionary();
    //   delete dictonary.wordSets;
    //   await request(app)
    //     .post(endpoints.dictionaries)
    //     .set(...defaultUser.authData.header)
    //     .send(dictonary)
    //     .expect(201)
    //     .expect((res) => {
    //       const {item} = res.body;
    //       res.body.item = _.omit(item, ['id', 'createdAt', 'updatedAt']);
    //     })
    //     .expect({
    //       message: 'dictonary created',
    //       item: {
    //         ...dictonary,
    //         owner: defaultUser.data.id,
    //         collaborators: [],
    //         wordSets: [],
    //       },
    //     });
    // });
  });
});
