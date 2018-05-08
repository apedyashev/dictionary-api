const Email = require('email-templates');
const config = require('../config');

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
  console.log('job datai', data);

  email
    .send({
      template: 'review-words',
      message: {
        to: data.to,
      },
      locals: {
        config: {
          // TODO
          baseUrl: 'http://localhost:3000',
        },
        ...data,
      },
    })
    .then(console.log)
    .catch(console.error);
};
