const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const toJson = require('@meanie/mongoose-to-json');
const _ = require('lodash');
const {Definition} = require('./schemas');
const Schema = mongoose.Schema;

const schema = new Schema({
  word: {
    type: String,
    required: [true, 'requried'],
  },
  defs: [Definition],
});
schema.plugin(timestamps);
schema.plugin(toJson);
schema.statics.addFromYandexResponse = async function(word, defs) {
  return this.create({
    word,
    defs: defs.map((curDef) => ({
      pos: curDef.pos,
      translations: curDef.tr.map((tr) => {
        return {
          text: tr.text,
          examples: tr.ex ? _.map(tr.ex, 'text') : [],
          synonyms: tr.syn ? _.map(tr.syn, 'text') : [],
          meanings: tr.mean ? _.map(tr.mean, 'text') : [],
        };
      }),
      transcription: curDef.ts,
    })),
  });
};

mongoose.model('Translation', schema);
