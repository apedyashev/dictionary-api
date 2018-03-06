/* global defaultUser */
const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const app = require('../../app.js');
const {endpoints} = require('../constants.js');
const mocks = require('../mocks');

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

            // wordSet.items.forEach((word) => {
            //   assert.exists(word.id, `word.id`);
            //   delete word.id;
            // });
          });
          res.body.item = _.omit(item, ['id', 'createdAt', 'updatedAt']);
        })
        .expect({
          message: 'dictonary created',
          item: {
            ...dictonary,
            owner: defaultUser.data.id,
            collaborators: [],
          },
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
            collaborators: [],
            wordSets: [],
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
