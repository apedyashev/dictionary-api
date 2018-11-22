const mongoose = require('mongoose');
const StatsSignupSchema = require('dictionary-api-common/models/Stats/Signup');

mongoose.model('StatsSignup', StatsSignupSchema);
