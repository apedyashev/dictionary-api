const express = require('express');
const router = express.Router();
const passport = require('passport');
const policies = require('dictionary-api-common/helpers/policies')(passport);
const {
  dictionaries: dictionaryController,
  words: wordController,
  wordsets: wordsetController,
} = require('./controllers');

/**
 * @swagger
 * tags:
 *   name: Dictionaries
 *   description: Dictionaries operations
 *
 */

/**
 * @swagger
 *
 * /dictionaries:
 *   get:
 *     summary: Returns list of user's dictionaries
 *     tags: [Dictionaries]
 *     produces:
 *       - application/json
 *     parameters:
 *       - $ref: "#/parameters/AuthorizationHeader"
 *       - $ref: "#/parameters/page"
 *       - $ref: "#/parameters/perPage"
 *       - $ref: "#/parameters/sortBy"
 *     responses:
 *       200:
 *         description: Ok
 *         schema:
 *           $ref: '#/definitions/DictionariesResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ResponseServerError'
 *
 */
router.get('/', policies.checkJwtAuth, dictionaryController.list);

/**
 * @swagger
 *
 * /dictionaries:
 *   post:
 *     summary: Creates a new dictionary
 *     tags: [Dictionaries]
 *     produces:
 *       - application/json
 *     parameters:
 *       - $ref: "#/parameters/AuthorizationHeader"
 *       - name: payload
 *         description: Endpoint's payload.
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/DictionaryPayload"
 *     responses:
 *       201:
 *         description: Ok
 *         schema:
 *           $ref: '#/definitions/DictionaryResponse'
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 *         schema:
 *           $ref: '#/definitions/ValidationError'
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ResponseServerError'
 *
 */
router.post('/', policies.checkJwtAuth, dictionaryController.create);

/**
 * @swagger
 *
 * /dictionaries/{id}:
 *   get:
 *     summary: Returns a dictionanry by ID
 *     tags: [Dictionaries]
 *     produces:
 *       - application/json
 *     parameters:
 *       - $ref: "#/parameters/AuthorizationHeader"
 *       - $ref: "#/parameters/id"
 *     responses:
 *       200:
 *         description: Ok
 *         schema:
 *           $ref: '#/definitions/DictionaryResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ResponseServerError'
 *
 */
router.get('/:id', policies.checkJwtAuth, dictionaryController.getOne);

/**
 * @swagger
 *
 * /dictionaries/{id}:
 *   patch:
 *     summary: Updates an existing dictionary
 *     tags: [Dictionaries]
 *     produces:
 *       - application/json
 *     parameters:
 *       - $ref: "#/parameters/AuthorizationHeader"
 *       - $ref: "#/parameters/id"
 *       - name: payload
 *         description: Endpoint's payload.
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/DictionaryPayload"
 *     responses:
 *       200:
 *         description: Ok
 *         schema:
 *           $ref: '#/definitions/DictionaryResponse'
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 *         schema:
 *           $ref: '#/definitions/ValidationError'
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ResponseServerError'
 *
 */
router.patch('/:id', policies.checkJwtAuth, dictionaryController.update);

/**
 * @swagger
 *
 * /dictionaries/{id}:
 *   delete:
 *     summary: Deletes a dictionary
 *     tags: [Dictionaries]
 *     produces:
 *       - application/json
 *     parameters:
 *       - $ref: "#/parameters/AuthorizationHeader"
 *       - $ref: "#/parameters/id"
 *     responses:
 *       200:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Dictionary doesn't belong to user
 *       404:
 *         description: Dictionary not found
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ResponseServerError'
 *
 */
router.delete('/:id', policies.checkJwtAuth, dictionaryController.delete);

/**
 * @swagger
 *
 * /dictionaries/{dictionaryId}/wordsets:
 *   post:
 *     summary: Adds a new wordset to the dictionary
 *     tags: [Dictionaries]
 *     produces:
 *       - application/json
 *     parameters:
 *       - $ref: "#/parameters/AuthorizationHeader"
 *       - $ref: "#/parameters/dictionaryId"
 *       - name: payload
 *         description: Endpoint's payload.
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/WordsetPayload"
 *     responses:
 *       200:
 *         description: Ok
 *         schema:
 *           $ref: '#/definitions/WordsetResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Dictionary not found
 *       422:
 *         description: Validation error
 *         schema:
 *           $ref: '#/definitions/ValidationError'
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ResponseServerError'
 *
 */
router.post('/:id/wordsets', policies.checkJwtAuth, wordsetController.create);

/**
 * @swagger
 *
 * /dictionaries/{id}/wordsets/{wordSetId}:
 *   patch:
 *     summary: Updates an existing wordset
 *     tags: [Dictionaries]
 *     produces:
 *       - application/json
 *     parameters:
 *       - $ref: "#/parameters/AuthorizationHeader"
 *       - $ref: "#/parameters/id"
 *       - $ref: "#/parameters/wordSetId"
 *       - name: payload
 *         description: Endpoint's payload.
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/WordsetPayload"
 *     responses:
 *       200:
 *         description: Ok
 *         schema:
 *           $ref: '#/definitions/WordsetResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Dictionary not found
 *       422:
 *         description: Validation error
 *         schema:
 *           $ref: '#/definitions/ValidationError'
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ResponseServerError'
 *
 */
router.patch('/:id/wordsets/:wordSetId', policies.checkJwtAuth, wordsetController.update);

// TODO: swagger
router.post(
  '/:dictionaryId/wordsets/:wordSetId/words/bunch-add',
  policies.checkJwtAuth,
  wordsetController.bunchWordsAdd
);

/**
 * @swagger
 *
 * /dictionaries/{id}/wordsets/{wordSetId}:
 *   delete:
 *     summary: Deletes a wordset
 *     tags: [Dictionaries]
 *     produces:
 *       - application/json
 *     parameters:
 *       - $ref: "#/parameters/AuthorizationHeader"
 *       - $ref: "#/parameters/id"
 *       - $ref: "#/parameters/wordSetId"
 *     responses:
 *       200:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Dictionary or wordset not found
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ResponseServerError'
 *
 */
router.delete('/:id/wordsets/:wordSetId', policies.checkJwtAuth, wordsetController.delete);

/**
 * @swagger
 *
 * /dictionaries/{id}/wordsets:
 *   get:
 *     summary: Returs list of dictionarie's wordsets
 *     tags: [Dictionaries]
 *     produces:
 *       - application/json
 *     parameters:
 *       - $ref: "#/parameters/AuthorizationHeader"
 *       - $ref: "#/parameters/id"
 *     responses:
 *       200:
 *         description: Ok
 *         schema:
 *           $ref: '#/definitions/WordsetsResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ResponseServerError'
 *
 */
router.get('/:id/wordsets', policies.checkJwtAuth, wordsetController.list);

/**
 * @swagger
 *
 * /dictionaries/words:
 *   post:
 *     summary: Create a new word for a dictionary
 *     tags: [Dictionaries]
 *     produces:
 *       - application/json
 *     parameters:
 *       - $ref: "#/parameters/AuthorizationHeader"
 *       - name: payload
 *         description: Endpoint's payload.
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/WordPayload"
 *     responses:
 *       200:
 *         description: Ok
 *         schema:
 *           $ref: '#/definitions/WordResponse'
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 *         schema:
 *           $ref: '#/definitions/ValidationError'
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ResponseServerError'
 *
 */
router.post('/words', policies.checkJwtAuth, wordController.create);

// TODO: swagger
router.patch('/words/learned', policies.checkJwtAuth, wordController.learned);

/**
 * @swagger
 *
 * /dictionaries/words/{id}:
 *   patch:
 *     summary: Updates an existing word
 *     tags: [Dictionaries]
 *     produces:
 *       - application/json
 *     parameters:
 *       - $ref: "#/parameters/AuthorizationHeader"
 *       - $ref: "#/parameters/id"
 *       - name: payload
 *         description: Endpoint's payload.
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/WordPayload"
 *     responses:
 *       200:
 *         description: Ok
 *         schema:
 *           $ref: '#/definitions/WordResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Word doesn't belong to user
 *       422:
 *         description: Validation error
 *         schema:
 *           $ref: '#/definitions/ValidationError'
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ResponseServerError'
 *
 */
router.patch('/words/:id', policies.checkJwtAuth, wordController.update);

router.delete('/words/batch', policies.checkJwtAuth, wordController.deleteBatch);

/**
 * @swagger
 *
 * /dictionaries/words/{id}:
 *   delete:
 *     summary: Deletes a word
 *     tags: [Dictionaries]
 *     produces:
 *       - application/json
 *     parameters:
 *       - $ref: "#/parameters/AuthorizationHeader"
 *       - $ref: "#/parameters/id"
 *     responses:
 *       200:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Word doesn't belong to user
 *       404:
 *         description: Word cannot be found by ID
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ResponseServerError'
 *
 */
// router.delete('/words/:id', policies.checkJwtAuth, wordController.delete);

/**
 * @swagger
 *
 * /dictionaries/{id}/words:
 *   get:
 *     summary: Returs list of words for a dictionary
 *     tags: [Dictionaries]
 *     produces:
 *       - application/json
 *     parameters:
 *       - $ref: "#/parameters/AuthorizationHeader"
 *       - $ref: "#/parameters/id"
 *     responses:
 *       200:
 *         description: Ok
 *         schema:
 *           $ref: '#/definitions/WordsResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ResponseServerError'
 *
 */
router.get('/:id/words', policies.checkJwtAuth, wordController.list);

/**
 * @swagger
 *
 * /dictionaries/{id}/wordsets/{wordSetId}/words:
 *   get:
 *     summary: Returs list of words for a wordset
 *     tags: [Dictionaries]
 *     produces:
 *       - application/json
 *     parameters:
 *       - $ref: "#/parameters/AuthorizationHeader"
 *       - $ref: "#/parameters/id"
 *       - $ref: "#/parameters/wordSetId"
 *     responses:
 *       200:
 *         description: Ok
 *         schema:
 *           $ref: '#/definitions/WordsResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ResponseServerError'
 *
 */
router.get('/:id/wordsets/:wordSetId/words', policies.checkJwtAuth, wordController.list);

router.get('/:dictionaryId/words/random', policies.checkJwtAuth, wordController.listRandom);

router.get(
  '/:dictionaryId/words/scheduled/:date/random',
  policies.checkJwtAuth,
  wordController.listRandom
);

module.exports = (app) => {
  app.use('/dictionaries', router);
};
