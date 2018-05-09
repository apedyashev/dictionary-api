const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');
const Schema = mongoose.Schema;

/**
 * @swagger
 * definitions:
 *   SerializedCollaborator:
 *     allOf:
 *       - $ref: '#/definitions/NestedBaseModel'
 *       - properties:
 *          user:
 *            type: string
 *          permissions:
 *            type: string
 *            enum: [read, add, update, deleteWords]
 */
const schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  permissions: {
    type: [
      {
        type: String,
        enum: ['read', 'add', 'update', 'deleteWords'],
      },
    ],
    default: ['read'],
  },
});
schema.plugin(toJson);

module.exports = schema;
