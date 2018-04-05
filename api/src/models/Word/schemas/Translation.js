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
  translation: {
    type: Schema.Types.ObjectId,
    default: null,
  },
  text: {type: String, required: [true, 'required']},
  pos: {type: String, default: ''},
  meanings: {type: [String], default: []},
  synonyms: {type: [String], default: []},
  examples: {type: [String], default: []},
});

schema.plugin(toJson);

module.exports = schema;
