/* global defaultUser */
const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  describe(`PATCH ${endpoints.words(':id')}`, () => {
    let dictionary;
    let newUserAuth;
    let newUserId;
    before(async () => {
      await request(app)
        .post(endpoints.dictionaries())
        .set(...defaultUser.authData.header)
        .send(mocks.dictionary())
        .expect(201)
        .expect((res) => {
          dictionary = res.body.item;
        });

      await request(app)
        .post(endpoints.register)
        .send(mocks.user())
        .expect(201)
        .expect((res) => {
          newUserId = res.body.user.id;
          newUserAuth = ['Authorization', `Bearer ${res.body.token}`];
        });
    });

    let wordToBeUpdated;
    beforeEach(async () => {
      const wordSetId = dictionary.wordSets[0].id;
      await request(app)
        .post(endpoints.words())
        .set(...defaultUser.authData.header)
        .send(mocks.word({dictionary: dictionary.id, wordSet: wordSetId}))
        .expect(201)
        .expect((res) => {
          wordToBeUpdated = res.body.item;
        });
    });

    it('should return 401 if auth header is not set', async () => {
      await request(app)
        .patch(endpoints.words(wordToBeUpdated.id))
        .send(mocks.word())
        .expect(401);
    });

    it('should return 422 if invalid fields are sent', async () => {
      const updatedWord = {
        ...wordToBeUpdated,
        word: '',
        translations: [],
      };
      await request(app)
        .patch(endpoints.words(wordToBeUpdated.id))
        .set(...defaultUser.authData.header)
        .send(updatedWord)
        .expect(422);
    });

    it('should update allowed fields', async () => {
      const updatedWord = {
        ...wordToBeUpdated,
        word: `${wordToBeUpdated.word}-updated`,
        wordSet: dictionary.wordSets[1].id,
        translations: mocks.word().translations,
        isLearned: true,
      };
      await request(app)
        .patch(endpoints.words(wordToBeUpdated.id))
        .set(...defaultUser.authData.header)
        .send(updatedWord)
        .expect(200)
        .expect((res) => {
          const {item} = res.body;
          assert.isArray(item.translations, 'word has translations array');
          item.translations.forEach((translation) => {
            assert.exists(translation.id, 'translation has id');
            delete translation.id;
          });
          res.body.item = _.omit(res.body.item, ['updatedAt']);
        })
        .expect({
          message: 'word updated',
          item: {
            ...updatedWord,
            // word isn't allowed to be updated
            word: wordToBeUpdated.word,
          },
        });
    });

    it('shouldn`t allow owner changing', async () => {
      // try to change owner
      const updatedWord = {
        ...wordToBeUpdated,
        owner: newUserId,
      };
      await request(app)
        .patch(endpoints.words(wordToBeUpdated.id))
        .set(...defaultUser.authData.header)
        .send(updatedWord)
        .expect(200)
        .expect((res) => {
          assert.equal(res.body.item.owner, wordToBeUpdated.owner, 'owner wasn`t changed');
        });
    });

    it('should return 403 if word doesn` belong to user', async () => {
      await request(app)
        .patch(endpoints.words(wordToBeUpdated.id))
        .set(...newUserAuth)
        .send(wordToBeUpdated)
        .expect(403);
    });
  });
});
