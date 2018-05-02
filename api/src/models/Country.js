const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const toJson = require('@meanie/mongoose-to-json');
const Schema = mongoose.Schema;

const schema = new Schema({
  name: {
    type: String,
  },
  nativeName: {
    type: String,
  },
});
schema.plugin(mongoosePaginate);
schema.plugin(toJson);

mongoose.model('Country', schema);
