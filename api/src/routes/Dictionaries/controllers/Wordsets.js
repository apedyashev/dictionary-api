const mongoose = require('mongoose');
const _ = require('lodash');
const {parseSortBy} = require('helpers/list');
const errorHandler = require('helpers/errorHandler');
const Dictionary = mongoose.model('Dictionary');
const Word = mongoose.model('Word');
const {ObjectId} = mongoose.Types;

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
      const {id, wordSetId} = req.params;
      const dictionary = await Dictionary.findOne({_id: id, owner: req.user.id});
      if (!dictionary) {
        return res.notFound('dictionary not found');
      }

      const wordSet = dictionary.wordSets.id(wordSetId);
      if (!wordSet) {
        return res.notFound('wordset not found');
      }
      wordSet.set({...req.body, _id: req.body.id});
      await dictionary.save();

      res.ok('word set updated', {item: wordSet});
    } catch (err) {
      errorHandler(res, 'wordset update error')(err);
    }
  },

  async bunchWordsAdd(req, res) {
    try {
      const {dictionaryId, wordSetId} = req.params;
      const {wordIds} = req.body;
      const dictionary = await Dictionary.findOne({_id: dictionaryId, owner: req.user.id});
      if (!dictionary) {
        return res.notFound('dictionary not found');
      }

      const wordSet = dictionary.wordSets.id(wordSetId);
      if (!wordSet) {
        return res.notFound('wordset not found');
      }
      for (let i = 0; i < wordIds.length; i++) {
        const wordId = wordIds[i];
        await Word.update({_id: wordId, owner: req.user.id}, {wordSet: wordSetId});
      }

      const items = await Word.find({_id: {$in: wordIds}, owner: req.user.id});
      res.ok('words were added to the wordset', {items: items});
    } catch (err) {
      errorHandler(res, 'wordset/words bunchWordsAdd error')(err);
    }
  },

  async delete(req, res) {
    try {
      const {id, wordSetId} = req.params;
      const dictionary = await Dictionary.findOne({_id: id, owner: req.user.id});
      if (!dictionary) {
        return res.notFound('dictionary not found');
      }

      const wordSet = dictionary.wordSets.id(wordSetId);
      if (!wordSet) {
        return res.notFound('wordset not found');
      }
      wordSet.remove();
      // NOTE: it also updates `state.wordSetsCount`
      await dictionary.save();

      // reset words' references to deleted wordset so they can be found only by dictionary
      await Word.update({wordSet: wordSetId}, {wordSet: null}, {multi: true});

      res.ok('wordset deleted');
    } catch (err) {
      errorHandler(res, 'wordset delete error')(err);
    }
  },

  async list(req, res) {
    try {
      const {id} = req.params;
      const limit = +req.query.perPage || 30;
      const page = +req.query.page || 1;
      const offset = limit * (page - 1);
      const sort = parseSortBy(req.query.sortBy, {prefix: 'wordSets', numberedOrdering: true});

      const items = await Dictionary.aggregate([
        {$match: {_id: ObjectId(id), owner: ObjectId(req.user.id)}},
        {$unwind: '$wordSets'},
        {$sort: sort},
        {$skip: offset},
        {$limit: limit},
        {$group: {_id: '$_id', wordSets: {$push: '$wordSets'}}},
      ]);
      const dict = await Dictionary.findOne({_id: id, owner: req.user.id});
      const total = dict ? dict.wordSets.length : 0;

      res.ok({
        items: items[0].wordSets,
        pagination: {
          page,
          perPage: limit,
          pages: Math.ceil(total / limit),
          total,
        },
      });
    } catch (err) {
      errorHandler(res, 'wordset list error')(err);
    }
  },
};
