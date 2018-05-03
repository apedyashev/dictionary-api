const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');
const Schema = mongoose.Schema;

const schema = new Schema({
  name: {type: String},
  // TODO: add offset for each timezone?
});
schema.plugin(toJson);

module.exports = schema;
