const Email = require('email-templates');
const path = require('path');
const config = require('../config');

const email = new Email({
  views: {
    root: path.join(__dirname, '..', 'emails', '/'),
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
  email
    .send({
      template: 'review-words',
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
