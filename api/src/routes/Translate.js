const express = require('express');
const router = express.Router();
const got = require('got');
const qs = require('querystring');
const policies = require('../helpers/policies');
const errorHandler = require('../helpers/errorHandler');
const config = require('../config');

/**
 * @swagger
 * tags:
 *   name: Translate
 *   description: Words/phrases translation
 *
 */

router.get('/', policies.checkJwtAuth, async (req, res) => {
  try {
    const {dictionaryKey} = config.translate.yandex;
    const {text, direction, uiLang} = req.query;
    const options = {
      ui: uiLang || req.i18n.language,
      key: dictionaryKey,
      lang: direction,
      text,
    };
    const dictResponse = await got(
      `https://dictionary.yandex.net/api/v1/dicservice.json/lookup?${qs.stringify(options)}`
    );
    res.ok({items: JSON.parse(dictResponse.body).def});
  } catch (err) {
    let message;
    switch (err.statusCode) {
      case 401:
        message = 'invalid api key';
        break;
      case 402:
        message = 'api key has been blocked';
        break;
      case 403:
        message = 'exceeded the daily limit on the number of requests';
        break;
      case 413:
        message = 'the text size exceeds the maximum';
        break;
      case 501:
        message = 'the specified translation direction is not supported';
        break;
      default:
    }
    errorHandler(res, 'translation lookup error')(message ? new Error(message) : err);
  }
});

module.exports = (app) => {
  app.use('/translate', router);
};
