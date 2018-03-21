const mongoose = require('mongoose');
const _ = require('lodash');
const {parseSortBy} = require('helpers/list');
const errorHandler = require('helpers/errorHandler');
const Dictionary = mongoose.model('Dictionary');
/**
 * @swagger
 * tags:
 *   name: Dictionaries
 *   description: Dictionaries operations
 *
 */
const actions = {
  async list(req, res) {
    try {
      const perPage = +req.query.perPage || 30;
      const page = +req.query.page || 1;
      const sort = parseSortBy(req.query.sortBy);

      const items = await Dictionary.paginate({owner: req.user.id}, {page, limit: perPage, sort});
      res.paginated(items).ok();
    } catch (err) {
      errorHandler(res, 'dictionaries list error')(err);
    }
  },

  async create(req, res) {
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
  },

  async getOne(req, res) {
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
  },

  async update(req, res) {
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
  },

  async delete(req, res) {},
};

module.exports = {
  dictionaries: actions,
  words: require('./Words'),
  wordsets: require('./Wordsets'),
};
