const mongoose = require('mongoose');
const _ = require('lodash');
const errorHandler = require('helpers/errorHandler');
const Dictionary = mongoose.model('Dictionary');

module.exports = {
  async create(req, res) {
    try {
      const {id: dictionaryId} = req.params;
      const dictionary = await Dictionary.findOne({_id: dictionaryId});
      if (!dictionary) {
        return res.notFound();
      }

      dictionary.wordSets.push(req.body);
      await dictionary.save();

      res.created('wordset created', {item: _.last(dictionary.wordSets)});
    } catch (err) {
      errorHandler(res, 'wordset create error')(err);
    }
  },

  async update(req, res) {
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
  },

  async delete(req, res) {
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
      // TODO: reset words' references to deleted wordset
      dictionary.wordSets = _.filter(dictionary.wordSets, (elem, idx) => idx !== wordSetIndex);
      // NOTE: it also updates `state.wordSetsCount`
      await dictionary.save();

      res.ok('wordset deleted');
    } catch (err) {
      errorHandler(res, 'wordset delete error')(err);
    }
  },
};
