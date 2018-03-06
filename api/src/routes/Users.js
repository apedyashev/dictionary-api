const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const policies = require('../helpers/policies');
const errorHandler = require('../helpers/errorHandler');
const config = require('../config');
const User = mongoose.model('User');

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

router.get('/', policies.checkAdmin, async (req, res) => {
  // await User.remove();
  const users = await User.find();
  console.log('users', users);
  res.ok(users);
});

module.exports = (app) => {
  app.use('/users', router);
};
