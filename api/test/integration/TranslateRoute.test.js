/* global defaultUser */
const {assert} = require('chai');
const request = require('supertest');
const app = require('../../app.js');
const {endpoints} = require('../constants.js');

describe('TranslateRoute', () => {
  describe(`GET ${endpoints.translate}`, () => {
    it('should returns list of translations', async () => {
      const text = 'well';
      await request(app)
        .get(endpoints.translate)
        .set(...defaultUser.authData.header)
        .query({text, direction: 'en-ru', uiLang: 'ru'})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.isArray(items);
          assert.isAtLeast(items.length, 1, 'response contains at least one translation');
          assert.equal(items[0].text, text, 'original text is presented');
        });
    });
  });
});
