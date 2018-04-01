/* global defaultUser */
const request = require('supertest');
const mongoose = require('mongoose');
const _ = require('lodash');
const slug = require('slug');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  describe(`PATCH ${endpoints.dictionaries(':id')}`, () => {
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
        .patch(endpoints.dictionaries(newDict.id))
        .send(newDict)
        .expect(401);
    });

    it('should update only allowed fields if header and payload are valid', async () => {
      const dictonary = mocks.dictionary(5);
      // only those fields can be updated by tested endpoint
      newDict.title = dictonary.title;
      newDict.translateDirection = dictonary.translateDirection;

      await request(app)
        .patch(endpoints.dictionaries(newDict.id))
        .set(...defaultUser.authData.header)
        .send(newDict)
        .expect(200)
        .expect((res) => {
          delete res.body.item.updatedAt;
        })
        .expect({
          message: 'dictionary updated',
          item: {
            ..._.omit(newDict, 'updatedAt'),
            slug: slug(newDict.translateDirection).toLowerCase(),
          },
        });
    });

    it('should return 404 if id is invalid', async () => {
      await request(app)
        .patch(endpoints.dictionaries(mongoose.Types.ObjectId()))
        .set(...defaultUser.authData.header)
        .send(newDict)
        .expect(404);
    });
  });
});
