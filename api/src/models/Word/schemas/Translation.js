const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');
const Schema = mongoose.Schema;

/**
 * @swagger
 * definitions:
 *   SerializedTranslation:
 *     allOf:
 *       - $ref: '#/definitions/NestedBaseModel'
 *       - properties:
 *          text:
 *            type: string
 *          pos:
 *            type: string
 *          meanings:
 *            type: array
 *            items:
 *              - type: string
 *          synonyms:
 *            type: array
 *            items:
 *              - type: string
 *          examples:
 *            type: array
 *            items:
 *              - type: string
 */
const schema = new Schema({
  text: String,
  pos: String,
  meanings: [String],
  synonyms: [String],
  examples: [String],
});

schema.plugin(toJson);

module.exports = schema;
