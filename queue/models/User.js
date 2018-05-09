const mongoose = require('mongoose');
const UserSchema = require('dictionary-api-common/models/User');

mongoose.model('User', UserSchema);
