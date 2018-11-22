const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const schema = new Schema({
  date: {
    type: String,
  },
  value: {
    type: Number,
    default: null
  }
});
schema.plugin(mongoosePaginate);

module.exports = schema;
