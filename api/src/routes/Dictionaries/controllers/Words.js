const mongoose = require('mongoose');
const _ = require('lodash');
const {parseSortBy} = require('helpers/list');
const errorHandler = require('helpers/errorHandler');
const Dictionary = mongoose.model('Dictionary');
const Word = mongoose.model('Word');

module.exports = {
  async create(req, res) {
    try {
      const {id, wordSetId} = req.params;
      if (!Dictionary.hasWordSet(id, wordSetId)) {
        return req.notFound();
      }

      const word = new Word({
        owner: req.user.id,
        dictonary: id,
        wordSet: wordSetId,
        ...req.body,
      });
      await word.save();

      // inc words count for the corresponding word set
      await Dictionary.findOneAndUpdate(
        {_id: id, 'wordSets._id': wordSetId},
        {$inc: {'wordSets.$.stats.wordsCount': 1}}
      );

      res.created('a word created', {item: word});
    } catch (err) {
      errorHandler(res, 'word create error')(err);
    }
  },

  async update(req, res) {
    try {
      const {wordId} = req.params;
      const word = await Word.findOne({_id: wordId});
      if (word.owner.toString() !== req.user.id) {
        return res.forbidden();
      }
      // word cannot be updated, only its translations
      const payload = _.omit(req.body, ['owner', 'word']);
      word.set(payload);
      await word.save();

      res.ok('word updated', {item: word});
    } catch (err) {
      errorHandler(res, 'word update error')(err);
    }
  },

  async delete(req, res) {
    try {
      const {id, wordSetId, wordId} = req.params;
      const word = await Word.findOne({_id: wordId});
      if (!word) {
        return res.notFound();
      }
      if (word.owner.toString() !== req.user.id) {
        return res.forbidden();
      }

      await word.remove();

      await Dictionary.findOneAndUpdate(
        {_id: id, 'wordSets._id': wordSetId},
        {$inc: {'wordSets.$.stats.wordsCount': -1}}
      );

      res.ok('word deleted');
    } catch (err) {
      errorHandler(res, 'word delete error')(err);
    }
  },

  async list(req, res) {
    try {
      const perPage = +req.query.perPage || 30;
      const page = +req.query.page || 1;
      const sort = parseSortBy(req.query.sortBy);
      const {search} = req.query;

      const query = {owner: req.user.id, dictionary: req.params.id};
      if (search) {
        query.word = new RegExp(search, 'ig');
      }

      const items = await Word.paginate(query, {page, limit: perPage, sort});
      res.paginated(items).ok();
    } catch (err) {
      errorHandler(res, 'words list error')(err);
    }
  },
};
