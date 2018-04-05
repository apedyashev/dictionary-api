const mongoose = require('mongoose');
const _ = require('lodash');
const {parseSortBy} = require('helpers/list');
const errorHandler = require('helpers/errorHandler');
const Dictionary = mongoose.model('Dictionary');
const Word = mongoose.model('Word');

module.exports = {
  async create(req, res) {
    try {
      const {dictionary: dictionaryId, wordSet: wordSetId} = req.body;
      if (dictionaryId && !await Dictionary.count({_id: dictionaryId, owner: req.user.id})) {
        return res.unprocessableEntity({dictionary: 'invalid dictionary'});
      }
      if (wordSetId && !await Dictionary.hasWordSet(dictionaryId, wordSetId)) {
        return res.unprocessableEntity({wordSet: 'invalid wordset'});
      }

      const word = new Word({
        owner: req.user.id,
        dictonary: dictionaryId,
        wordSet: wordSetId || null,
        ...req.body,
      });
      await word.save();

      await Dictionary.findOneAndUpdate({_id: dictionaryId}, {$inc: {'stats.wordsCount': 1}});
      // inc words count for the corresponding word set
      await Dictionary.findOneAndUpdate(
        {_id: dictionaryId, 'wordSets._id': wordSetId},
        {$inc: {'wordSets.$.stats.wordsCount': 1}}
      );

      res.created('a word created', {item: word});
    } catch (err) {
      errorHandler(res, 'word create error')(err);
    }
  },

  async update(req, res) {
    try {
      const {id: wordId} = req.params;
      const word = await Word.findOne({_id: wordId});
      if (word.owner.toString() !== req.user.id) {
        return res.forbidden();
      }
      const {dictionary: dictionaryId, wordSet: wordSetId} = req.body;
      if (!dictionaryId || !await Dictionary.count({_id: dictionaryId})) {
        return res.unprocessableEntity({dictionary: 'invalid dictionary'});
      }
      if (wordSetId && !await Dictionary.hasWordSet(dictionaryId, wordSetId)) {
        return res.unprocessableEntity({wordSet: 'invalid wordset'});
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
      const {id: wordId} = req.params;
      const word = await Word.findOne({_id: wordId});
      if (!word) {
        return res.notFound();
      }
      if (word.owner.toString() !== req.user.id) {
        return res.forbidden();
      }
      const wordSetId = word.wordSet;
      const dictionaryId = word.dictionary;

      await word.remove();
      await Dictionary.findOneAndUpdate(
        {_id: dictionaryId, 'wordSets._id': wordSetId},
        {$inc: {'wordSets.$.stats.wordsCount': -1, 'stats.wordsCount': -1}}
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

      const {id: dictionaryId, wordSetId} = req.params;
      const query = {owner: req.user.id, dictionary: dictionaryId};
      if (wordSetId) {
        query.wordSet = wordSetId;
      }
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
