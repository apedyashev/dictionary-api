const express = require('express');
const router = express.Router();
const policies = require('helpers/policies');
const {
  dictionaries: dictionaryControllers,
  words: wordControllers,
  wordsets: wordsetControllers,
} = require('./controllers');

router.get('/', policies.checkJwtAuth, dictionaryControllers.list);
router.post('/', policies.checkJwtAuth, dictionaryControllers.create);
router.get('/:slug', policies.checkJwtAuth, dictionaryControllers.getOne);
router.patch('/:slug', policies.checkJwtAuth, dictionaryControllers.update);
router.delete('/:id', policies.checkJwtAuth, dictionaryControllers.delete);

router.patch('/:slug/wordsets/:wordSetSlug', policies.checkJwtAuth, wordsetControllers.update);
router.delete('/:slug/wordsets/:wordSetSlug', policies.checkJwtAuth, wordsetControllers.delete);

// create a word and associate it with the dictionary and wordset
router.post('/:id/wordsets/:wordSetId/words', policies.checkJwtAuth, wordControllers.create);
// create a word and associate it with the dictionary
router.post('/:id/words', policies.checkJwtAuth, wordControllers.create);

router.patch(
  '/:id/wordsets/:wordSetId/words/:wordId',
  policies.checkJwtAuth,
  wordControllers.update
);
router.delete(
  '/:id/wordsets/:wordSetId/words/:wordId',
  policies.checkJwtAuth,
  wordControllers.delete
);
router.get('/:id/words', policies.checkJwtAuth, wordControllers.list);

module.exports = (app) => {
  app.use('/dictionaries', router);
};
