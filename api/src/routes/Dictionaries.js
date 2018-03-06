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
    // set wordsCount to 0 since it isn't allowed to be set by user
    if (reqBody && _.isArray(reqBody.wordSets)) {
      reqBody.wordSets.forEach((wordSet) => {
        wordSet.wordsCount = 0;
      });
    }

    const dictionary = new Dictionary({
      owner: req.user.id,
      ...reqBody,
    });
    await dictionary.save();
    res.created('dictonary created', {item: dictionary});
  } catch (err) {
    errorHandler(res, 'dictionary create error')(err);
  }
});

router.post('/:id/words', policies.checkJwtAuth, async (req, res) => {
  try {
    const word = new Word(req.body);
    res.created('words created', {item: word});
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
