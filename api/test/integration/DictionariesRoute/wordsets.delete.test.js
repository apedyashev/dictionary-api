/* global defaultUser */
const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const app = require(`${TEST_BASE}/../app.js`);
const {endpoints} = require(`${TEST_BASE}/constants.js`);
const mocks = require(`${TEST_BASE}/mocks`);

describe('Dictionaries Route', () => {
  describe(`DELETE ${endpoints.dictionaryWordSets(':dictionaryId', ':wordSetId')}`, () => {
    let newDict;
    const userWords = [];
    const wordsInDictionaryCount = 20;
    beforeEach(async () => {
      const wordSetsCount = 5;
      await request(app)
        .post(endpoints.dictionaries())
        .set(...defaultUser.authData.header)
        .send(mocks.dictionary(wordSetsCount))
        .expect(201)
        .expect((res) => {
          newDict = res.body.item;
        });
      for (let i = 0; i < wordsInDictionaryCount; i++) {
        const wordSetId = newDict.wordSets[_.random(wordSetsCount - 1)].id;
        await request(app)
          .post(endpoints.words())
          .set(...defaultUser.authData.header)
          .send(mocks.word({dictionary: newDict.id, wordSet: wordSetId}))
          .expect(201)
          .expect((res) => {
            userWords.push(res.body.item);
          });
      }
    });

    it('should return 401 if auth header is not set', async () => {
      await request(app)
        .delete(endpoints.dictionaryWordSets(newDict.id, newDict.wordSets[3].id))
        .expect(401);
    });

    it('should delete a wordset and reset it`s words references to wordset', async () => {
      // get the list of all words in the dictionanry before wordset is deleted
      let wordsBeforeDelete;
      await request(app)
        .get(endpoints.dictionaryWords(newDict.id))
        .set(...defaultUser.authData.header)
        .query({sortBy: 'word:asc', page: 1, perPage: 100})
        .expect(200)
        .expect((res) => {
          wordsBeforeDelete = res.body.items;
        });

      // delete the wordset
      const deletedWordsetId = newDict.wordSets[3].id;
      await request(app)
        .delete(endpoints.dictionaryWordSets(newDict.id, deletedWordsetId))
        .set(...defaultUser.authData.header)
        .expect(200)
        .expect({
          message: 'wordset deleted',
        });

      // pull the dictionary and check that wordset was removed from it
      _.pullAt(newDict.wordSets, 3);
      newDict.stats.wordSetsCount = newDict.wordSets.length;
      const numOfWordInDeletedWordset = _.filter(userWords, (word) => {
        return word.wordSet === deletedWordsetId;
      }).length;
      newDict.stats.wordsCount = wordsInDictionaryCount - numOfWordInDeletedWordset;
      await request(app)
        .get(endpoints.dictionaries(newDict.id))
        .set(...defaultUser.authData.header)
        .expect(200)
        .expect((res) => {
          const {item} = res.body;
          assert.exists(item.createdAt, 'item.createdAt');
          res.body.item = _.omit(item, ['updatedAt']);
          // don't check wordsCount
          _.forEach(res.body.item.wordSets, (wordSet) => {
            wordSet.stats.wordsCount = 0;
          });
        })
        .expect({
          item: _.omit(newDict, ['updatedAt']),
        });

      // check that words.wordset were reset
      await request(app)
        .get(endpoints.dictionaryWords(newDict.id))
        .set(...defaultUser.authData.header)
        .query({sortBy: 'word:asc', page: 1, perPage: 100})
        .expect(200)
        .expect((res) => {
          const {items} = res.body;
          assert.equal(
            wordsBeforeDelete.length,
            items.length,
            'wordset delete doesn`t change number of words'
          );

          const expectedIds = _(wordsBeforeDelete)
            .filter((word) => word.wordSet === deletedWordsetId)
            .map('id')
            .value();
          const resetIds = _(items)
            .filter((word) => word.wordSet === null)
            .map('id')
            .value();
          assert.sameOrderedMembers(
            expectedIds,
            resetIds,
            'only deleted wordset`s words were reset'
          );
        });
    });
  });
});
