const mongoose = require('mongoose');
const _ = require('lodash');
// const got = require('got');
const util = require('util');
const logger = require('dictionary-api-common/helpers/logger');
const imageSearch = require('dictionary-api-common/helpers/imageSearch');
const {parseSortBy} = require('dictionary-api-common/helpers/list');
const errorHandler = require('dictionary-api-common/helpers/errorHandler');
const Dictionary = mongoose.model('Dictionary');
const Word = mongoose.model('Word');
const User = mongoose.model('User');
const LearningSchedule = mongoose.model('LearningSchedule');
const {ObjectId} = mongoose.Types;

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
      let imagesData;
      // wrap with the try/catch since we don't want to fail entire request just because of failed
      // image API
      try {
        // const imagesResponse = await got(
        //   `https://api.qwant.com/api/search/images?count=100&offset=1&q=${req.body.word}`
        // );
        // imagesData = JSON.parse(imagesResponse.body).data.result.items;
        imagesData = await imageSearch.run(req.body.word);
      } catch (imageApiErr) {
        logger.error('Image search API error', {error: util.inspect(imageApiErr)});
      }

      const word = new Word({
        owner: req.user.id,
        dictonary: dictionaryId,
        wordSet: wordSetId || null,
        ...req.body,
        image: imagesData && imagesData[0] ? imagesData[0].url : '',
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
      if (dictionaryId && !await Dictionary.count({_id: dictionaryId})) {
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

  //  TODO: tests
  async deleteBatch(req, res) {
    try {
      const {wordIds = []} = req.body;
      const deletedWordIds = [];
      for (let i = 0; i < wordIds.length; i++) {
        const wordId = wordIds[i];
        const word = await Word.findOne({_id: wordId, owner: req.user.id});
        if (word) {
          const wordSetId = word.wordSet;
          const dictionaryId = word.dictionary;
          await word.remove();
          deletedWordIds.push(wordId);

          // update stats
          await Dictionary.findOneAndUpdate({_id: dictionaryId}, {$inc: {'stats.wordsCount': -1}});
          // inc words count for the corresponding word set
          await Dictionary.findOneAndUpdate(
            {_id: dictionaryId, 'wordSets._id': wordSetId},
            {$inc: {'wordSets.$.stats.wordsCount': -1}}
          );
        }
      }

      res.ok('words deleted', {items: deletedWordIds});
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

  // TODO: tests
  async learned(req, res) {
    try {
      const {learnedStatuses = []} = req.body;
      const items = [];
      for (let i = 0; i < learnedStatuses.length; i++) {
        const {wordId, data} = learnedStatuses[i];
        const word = await Word.findOne({_id: wordId});
        const {wordTranslation, writing, translationWord} = data;
        const isLearned = wordTranslation && writing && translationWord;
        if (isLearned) {
          word.learnedAt = new Date();
          word.reviewInDays = 2 * word.reviewInDays + 1;

          const user = await User.findOne({_id: req.user.id});
          const scheduleItem = await LearningSchedule.addWord(word);
        }
        word.set({learnedStatus: data});
        await word.save();
        items.push(word);
      }
      res.ok({items});
    } catch (err) {
      errorHandler(res, 'words learned error')(err);
    }
  },

  // /words/suggested-translations
  // TODO: test
  async listRandom(req, res) {
    try {
      const {excludeWords = [], limit = 10, onlyForLearning = false} = req.query;
      const {dictionaryId, date} = req.params;
      const matchQuery = {
        owner: ObjectId(req.user.id),
        dictionary: ObjectId(dictionaryId),
        _id: {$not: {$in: excludeWords}},
      };
      if (date && /^\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/.test(date)) {
        // TODO: timezone
        const scheduleItem = await LearningSchedule.findOne({date: new Date(date)});

        const scheduledWordIds = scheduleItem.dictionaries
          .find((dict) => String(dict._id) === dictionaryId)
          .words.map(({_id}) => _id);
        matchQuery._id.$in = scheduledWordIds;
      }
      if (onlyForLearning) {
        matchQuery.isLearned = false;
      }
      const documents = await Word.aggregate([{$match: matchQuery}, {$sample: {size: +limit}}]);

      const items = documents.map((doc) => ({..._.omit(doc, ['_id', '__v']), id: doc._id}));
      res.ok({items});
    } catch (err) {
      errorHandler(res, 'list of suggested translations error')(err);
    }
  },

  // TODO: test, docs
  async changeImage(req, res) {
    try {
      const {wordId} = req.params;
      const word = await Word.findOne({_id: wordId});

      // const imagesResponse = await got(
      //   `https://api.qwant.com/api/search/images?count=100&offset=1&q=${word.word}`
      // );
      // const imagesData = JSON.parse(imagesResponse.body).data.result.items;
      const imagesData = await imageSearch.run(word.word);
      console.log('imagesData', imagesData);
      const availableImages = _(imagesData)
        .map('url')
        .without(word.image)
        .value();
      word.image = availableImages[_.random(0, availableImages.length - 1)] || '';
      word.save();

      res.ok({item: word});
    } catch (err) {
      errorHandler(res, 'change image error')(err);
    }
  },
};
