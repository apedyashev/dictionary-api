const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');
const Schema = mongoose.Schema;

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
