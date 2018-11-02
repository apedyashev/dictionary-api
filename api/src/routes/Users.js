const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const _ = require('lodash');
const passport = require('passport');
const policies = require('dictionary-api-common/helpers/policies')(passport);
const errorHandler = require('dictionary-api-common/helpers/errorHandler');
const config = require('../config');
const User = mongoose.model('User');
const {parseSortBy} = require('dictionary-api-common/helpers/list');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Users operations
 *
 */

/**
 * @swagger
 *
 * /users/language:
 *   put:
 *     summary: Change locale
 *     tags: [Users]
 *     produces:
 *       - application/json
 *     parameters:
 *       - $ref: "#/parameters/AuthorizationHeader"
 *       - name: payload
 *         description: New locale id
 *         in: body
 *         schema:
 *           $ref: "#/definitions/LanguageChangePayload"
 *     responses:
 *       204:
 *         description: Ok
 *         schema:
 *           $ref: '#/definitions/SuccessfulAuthResponse'
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 *         schema:
 *           $ref: "#/definitions/ValidationError"
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ResponseServerError'
 *
 * definitions:
 *   LanguageChangePayload:
 *     type: object
 *     required:
 *       - locale
 *     properties:
 *       locale:
 *         type: string
 */
// TODO: tobe removed
router.put('/language', policies.checkJwtAuth, async (req, res) => {
  const {locale} = req.body;
  try {
    if (!!locale) {
      if (!config.allowedLanguages.includes(locale)) {
        return res.unprocessableEntity({
          locale: {message: 'selected language is not allowed', value: locale},
        });
      }

      req.i18n.changeLanguage(locale);
      // update() won't update redis cache, so we have to use save()
      const user = await User.findOne({_id: req.user.id});
      if (user) {
        user.locale = locale;
        await user.save();
      }
      res.noContent();
    } else {
      res.unprocessableEntity({locale: 'locale must be set'});
    }
  } catch (err) {
    errorHandler(res, 'language changing error')(err);
  }
});

// TODO: swagger, tests
router.patch('/me', policies.checkJwtAuth, async (req, res) => {
  try {
    const allowedFields = _.omit(req.body, ['email', 'roles', 'socialId', 'provider', 'salt']);
    const user = await User.findOne({_id: req.user.id});
    user.set(allowedFields);
    user.save();

    res.ok('profile updated', {item: user});
  } catch (err) {
    errorHandler(res, 'language changing error')(err);
  }
});

router.get('/', policies.checkAdmin, async (req, res) => {
  const perPage = +req.query.perPage || 30;
  const page = +req.query.page || 1;
  const sort = parseSortBy(req.query.sortBy);
  const {search} = req.query;
  if (search) {
    // TODO: allow search by name
    query.email = new RegExp(search, 'ig');
  }

  const query = {};
  const items = await User.paginate(query, {page, limit: perPage, sort});
  res.paginated(items).ok();
  res.ok(users);
});

module.exports = (app) => {
  app.use('/users', router);
};
