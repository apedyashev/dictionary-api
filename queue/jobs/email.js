const Email = require('email-templates');
const path = require('path');
const config = require('../config');
console.log('path1', path.join(__dirname, '..', 'emails', 'review-words'));

const email = new Email({
  views: {
    options: {
      extension: 'ejs',
    },
  },
  message: {
    from: 'Spaced Repetition Dictionary',
  },
  send: true,
  transport: {
    service: 'Gmail',
    auth: config.email.auth,
  },
});

module.exports = async function(data) {
  console.log('path', path.join(__dirname, '..', 'emails', 'review-words'));

  email
    .send({
      template: path.join(__dirname, '..', 'emails', 'review-words'),
      message: {
        to: data.to,
      },
      locals: {
        config,
        ...data,
      },
    })
    // TODO
    // .then(console.log)
    .catch(console.error);
};
