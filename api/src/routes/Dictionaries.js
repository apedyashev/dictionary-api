const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const _ = require('lodash');
const policies = require('../helpers/policies');
const errorHandler = require('../helpers/errorHandler');
const config = require('../config');
const User = mongoose.model('User');
const Dictionary = mongoose.model('Dictionary');
const Word = mongoose.model('Word');

/**
 * @swagger
 * tags:
 *   name: Dictionaries
 *   description: Dictionaries operations
 *
 */

router.post('/', policies.checkJwtAuth, async (req, res) => {
  try {
    const reqBody = req.body;
    let wordSetsCount = 0;
    // remove wordSet.stats since it cannot by controlled by client directly
    if (reqBody && _.isArray(reqBody.wordSets)) {
      wordSetsCount = reqBody.wordSets.length;
      reqBody.wordSets.forEach((wordSet) => {
        delete wordSet.stats;
      });
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

router.put('/:slug', policies.checkJwtAuth, async (req, res) => {
  try {
    const slug = req.param('slug');
    const dict = await Dictionary.findOne({slug});
    if (!dict) {
      return req.notFound('dictionary not found');
    }

    dict.set(req.body);
    await dict.save();
    req.ok();
  } catch (err) {
    errorHandler(res, 'dictionary update error')(err);
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

router.get('/', policies.checkJwtAuth, async (req, res) => {
  try {
    const items = await Dictionary.find({owner: req.user.id});
    res.ok({items});
  } catch (err) {
    errorHandler(res, 'dictionary create error')(err);
  }
});

module.exports = (app) => {
  app.use('/dictionaries', router);
};
