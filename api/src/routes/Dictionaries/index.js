const express = require('express');
const router = express.Router();
const policies = require('helpers/policies');
const {
  dictionaries: dictionaryController,
  words: wordController,
  wordsets: wordsetController,
} = require('./controllers');

router.get('/', policies.checkJwtAuth, dictionaryController.list);
router.post('/', policies.checkJwtAuth, dictionaryController.create);
router.get('/:id', policies.checkJwtAuth, dictionaryController.getOne);
router.patch('/:id', policies.checkJwtAuth, dictionaryController.update);
router.delete('/:id', policies.checkJwtAuth, dictionaryController.delete);

router.post('/:id/wordsets', policies.checkJwtAuth, wordsetController.create);
router.patch('/:id/wordsets/:wordSetId', policies.checkJwtAuth, wordsetController.update);
router.delete('/:id/wordsets/:wordSetId', policies.checkJwtAuth, wordsetController.delete);
router.get('/:id/wordsets', policies.checkJwtAuth, wordsetController.list);

router.post('/words', policies.checkJwtAuth, wordController.create);
router.patch('/words/:id', policies.checkJwtAuth, wordController.update);
router.delete('/words/:id', policies.checkJwtAuth, wordController.delete);
router.get('/:id/words', policies.checkJwtAuth, wordController.list);
router.get('/:id/wordsets/:wordSetId/words', policies.checkJwtAuth, wordController.list);

module.exports = (app) => {
  app.use('/dictionaries', router);
};
