const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const _ = require('lodash');
const policies = require('../helpers/policies');
const {parseSortBy} = require('../helpers/list');
const errorHandler = require('../helpers/errorHandler');
const Dictionary = mongoose.model('Dictionary');
const Word = mongoose.model('Word');

/**
 * @swagger
 * tags:
 *   name: Dictionaries
 *   description: Dictionaries operations
 *
 */
router.get('/', policies.checkJwtAuth, async (req, res) => {
  try {
    const perPage = +req.query.perPage || 30;
    const page = +req.query.page || 1;
    const sort = parseSortBy(req.query.sortBy);

    const items = await Dictionary.paginate({owner: req.user.id}, {page, limit: perPage, sort});
    res.paginated(items).ok();
  } catch (err) {
    errorHandler(res, 'dictionaries list error')(err);
  }
});

router.post('/', policies.checkJwtAuth, async (req, res) => {
  try {
    const reqBody = req.body;
    let wordSetsCount = 0;
    if (reqBody && _.isArray(reqBody.wordSets)) {
      wordSetsCount = reqBody.wordSets.length;
    }

    const dictionary = new Dictionary({
      owner: req.user.id,
      ...reqBody,
      stats: {
        wordSetsCount,
      },
    });
    await dictionary.save();
    res.created('dictonary created', {item: dictionary});
  } catch (err) {
    errorHandler(res, 'dictionary create error')(err);
  }
});

router.get('/:slug', policies.checkJwtAuth, async (req, res) => {
  try {
    const {slug} = req.params;
    const item = await Dictionary.findOne({slug});
    if (!item) {
      return res.notFound('dictionary not found');
    }
    return res.ok({item});
  } catch (err) {
    errorHandler(res, 'dictionary get error')(err);
  }
});

router.put('/:slug', policies.checkJwtAuth, async (req, res) => {
  try {
    const {slug} = req.params;
    const dict = await Dictionary.findOne({slug});
    if (!dict) {
      return res.notFound('dictionary not found');
    }

    dict.set(_.omit(req.body, ['wordSets', 'owner', 'slug', 'stats', 'collaborators']));
    await dict.save();
    res.ok('dictionary updated', {item: dict});
  } catch (err) {
    errorHandler(res, 'dictionary update error')(err);
  }
});

router.put('/:slug/wordsets/:wordSetSlug', policies.checkJwtAuth, async (req, res) => {
  try {
    const {slug, wordSetSlug} = req.params;
    const dictonary = await Dictionary.findOne({slug});
    if (!dictonary) {
      return res.notFound('dictionary not found');
    }
    const wordSetIndex = _.findIndex(dictonary.wordSets, (ws) => ws.slug === wordSetSlug);
    if (wordSetIndex < 0) {
      return res.notFound('wordset not found');
    }
    dictonary.wordSets[wordSetIndex] = {...req.body, _id: req.body.id};
    await dictonary.save();

    res.ok('word set updated', {item: dictonary.wordSets[wordSetIndex]});
  } catch (err) {
    errorHandler(res, 'wordset update error')(err);
  }
});

router.delete('/:slug/wordsets/:wordSetSlug', policies.checkJwtAuth, async (req, res) => {
  try {
    const {slug, wordSetSlug} = req.params;
    const dictionary = await Dictionary.findOne({slug});
    if (!dictionary) {
      return res.notFound('dictionary not found');
    }
    const wordSetIndex = _.findIndex(dictionary.wordSets, (ws) => ws.slug === wordSetSlug);
    if (wordSetIndex < 0) {
      return res.notFound('wordset not found');
    }

    // TODO: check if wordset has words
    dictionary.wordSets = _.filter(dictionary.wordSets, (elem, idx) => idx !== wordSetIndex);
    await dictionary.save();

    res.noContent();
  } catch (err) {
    errorHandler(res, 'wordset delete error')(err);
  }
});

router.post('/:id/wordsets/:wordSetId/words', policies.checkJwtAuth, async (req, res) => {
  try {
    const dictionaryId = req.param('id');
    const wordSetId = req.param('wordSetId');
    if (!Dictionary.hasWordSet(dictionaryId, wordSetId)) {
      return req.notFound();
    }

    const word = new Word({
      owner: req.user.id,
      wordSet: wordSetId,
      ...req.body,
    });
    await word.save();

    // inc words count for the corresponding word set
    await Dictionary.findOneAndUpdate(
      {_id: dictionaryId, 'wordSets._id': wordSetId},
      {$inc: {'wordSets.$.stats.wordsCount': 1}}
    );

    res.created('a word created', {item: word});
  } catch (err) {
    errorHandler(res, 'words create error')(err);
  }
});

module.exports = (app) => {
  app.use('/dictionaries', router);
};
