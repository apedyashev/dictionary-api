const mongoose = require('mongoose');
const _ = require('lodash');
const {parseSortBy} = require('helpers/list');
const errorHandler = require('helpers/errorHandler');
const Dictionary = mongoose.model('Dictionary');
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

  async delete(req, res) {
    try {
      const {id, wordSetId} = req.params;
      const dictionary = await Dictionary.findOne({_id: id, owner: req.user.id});
      if (!dictionary) {
        return res.notFound('dictionary not found');
      }

      // TODO: reset words' references to deleted wordset
      const wordSet = dictionary.wordSets.id(wordSetId);
      if (!wordSet) {
        return res.notFound('wordset not found');
      }
      wordSet.remove();
      // NOTE: it also updates `state.wordSetsCount`
      await dictionary.save();

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
