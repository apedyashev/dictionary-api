const usersData = require('./seeds/users.json');
const mongoose = require('../../mongoose.js')();
const User = mongoose.model('User');

exports.up = function(next) {
  const promises = usersData.map((userData) => {
    const user = new User(userData);
    return user.save();
  });
  Promise.all(promises)
    .then(() => next())
    .catch(next);
};

exports.down = function(next) {
  User.collection.drop(next);
};
