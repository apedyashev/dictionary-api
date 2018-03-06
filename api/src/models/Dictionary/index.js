const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const toJson = require('@meanie/mongoose-to-json');
const {Collaborator, WordSet} = require('./schemas');
const Schema = mongoose.Schema;

const schema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'required'],
  },
  translateFrom: {
    type: String,
    required: [true, 'required'],
  },
  translateTo: {
    type: String,
    required: [true, 'required'],
  },
  collaborators: {
    type: [Collaborator],
    default: [],
  },
  wordSets: {
    type: [WordSet],
    default: [],
  },
});
schema.plugin(timestamps);
schema.plugin(toJson);

mongoose.model('Dictionary', schema);
