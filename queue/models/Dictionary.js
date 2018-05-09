const mongoose = require('mongoose');
const DictionarySchema = require('dictionary-api-common/models/Dictionary');

mongoose.model('Dictionary', DictionarySchema);
