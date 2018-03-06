/* global defaultUser */
const {assert} = require('chai');
const request = require('supertest');
const _ = require('lodash');
const app = require('../../app.js');
const {endpoints} = require('../constants.js');
const mocks = require('../mocks');

describe('AuthController', () => {
  describe(`POST ${endpoints.register}`, () => {
    it('should return 422 is request body is empty', async () => {
      await request(app)
        .post(endpoints.register)
        .expect(422)
        .expect((res) => {
          // reset it since we don't really want to check it
          res.body.originalError = null;
        })
        .expect({
          originalError: null,
          validationErrors: {
            email: 'required',
            password: 'required',
            firstName: 'required',
            lastName: 'required',
          },
        });
    });

    const userData = {email: 'email@example', password: '123456', firstName: '', lastName: ''};
    it('should return 422 is all fields are invalid', async () => {
      await request(app)
        .post(endpoints.register)
        .send(userData)
        .expect(422)
        .expect((res) => {
          // reset it since we don't really want to check it
          res.body.originalError = null;
        })
        .expect({
          originalError: null,
          validationErrors: {
            email: 'invalid email',
            password: 'password must be longer',
            firstName: 'required',
            lastName: 'required',
          },
        });
    });

    it('should return 422 if only password is valid', async () => {
      userData.password = '1234567';
      await request(app)
        .post(endpoints.register)
        .send(userData)
        .expect(422)
        .expect((res) => {
          // reset it since we don't really want to check it
          res.body.originalError = null;
        })
        .expect({
          originalError: null,
          validationErrors: {
            email: 'invalid email',
            passwordConfirmation: 'enter the same password',
            firstName: 'required',
            lastName: 'required',
          },
        });
    });

    it('should return 201, user and token if all fields are valid', async () => {
      // try to register admin and check if it's not possible
      const newUser = mocks.user({roles: ['login', 'admin']});
      await request(app)
        .post(endpoints.register)
        .send(newUser)
        .expect(201)
        .expect((res) => {
          assert.isString(res.body.token, 'token key');

          const {user} = res.body;
          assert.isString(res.body.token, 'token key');
          assert.exists(user.id, 'user.id');
          assert.exists(user.createdAt, 'user.createdAt');
          assert.exists(user.updatedAt, 'user.updatedAt');

          res.body.user = _.omit(user, ['id', 'createdAt', 'updatedAt']);
          res.body.token = null;
        })
        .expect({
          // token has been already checked above
          token: null,
          message: 'user registered',
          user: {
            ..._.omit(newUser, ['password', 'passwordConfirmation']),
            // check that 'admin' role was not added
            roles: ['login'],
            locale: 'en-US',
          },
        });
    });
  });

  describe(`POST ${endpoints.login}`, () => {
    it('should login the default user', async () => {
      await request(app)
        .post(endpoints.login)
        .send({email: defaultUser.data.email, password: defaultUser.data.password})
        .expect(200)
        .expect((res) => {
          assert.isObject(res.body.user, 'logged user data');
          assert.strictEqual(
            res.body.user.email,
            defaultUser.data.email,
            'logged user email is correct'
          );
        });
    });

    it('should return 401 Unautorized if email is empty', async () => {
      await request(app)
        .post(endpoints.login)
        .send({email: '', password: defaultUser.password})
        .expect(401);
    });

    it('should return 401 Unautorized if password is empty', async () => {
      await request(app)
        .post(endpoints.login)
        .send({email: defaultUser.email, password: ''})
        .expect(401);
    });

    it('should return 401 Unautorized if email is incorrect', async () => {
      await request(app)
        .post(endpoints.login)
        .send({email: `fake-${defaultUser.email}`, password: defaultUser.password})
        .expect(401);
    });

    it('should return 401 Unautorized if password is incorrect', async () => {
      await request(app)
        .post(endpoints.login)
        .send({email: defaultUser.email, password: `fake-${defaultUser.password}`})
        .expect(401);
    });
  });

  describe(`GET ${endpoints.profile}`, () => {
    it('return 401 status code if token is not set', async () => {
      await request(app)
        .get(endpoints.profile)
        .expect(401);
    });

    it('return 401 status code if token is invalid', async () => {
      const {header} = defaultUser.authData;
      await request(app)
        .get(endpoints.profile)
        .set(header[0], `${header[1]}fake`)
        .expect(401);
    });

    it('return 200 status code if token is set', async () => {
      await request(app)
        .get(endpoints.profile)
        .set(...defaultUser.authData.header)
        .expect(200)
        .expect((res) => {
          const {user} = res.body;
          assert.exists(user.createdAt, 'user.createdAt');
          assert.exists(user.updatedAt, 'user.updatedAt');

          res.body.user = _.omit(user, ['createdAt', 'updatedAt']);
        })
        .expect({
          user: {
            ..._.omit(defaultUser.data, ['password', 'passwordConfirmation']),
            roles: ['login'],
            locale: 'en-US',
          },
        });
    });
  });
});

describe(`DELETE ${endpoints.logout}`, () => {
  let currentAuthHeader = null;
  function checkToken(expectedCode) {
    return request(app)
      .get(endpoints.profile)
      .set('Authorization', currentAuthHeader)
      .expect(expectedCode);
  }

  before(() => {
    const currentUser = mocks.user();
    return request(app)
      .post(endpoints.register)
      .send(currentUser)
      .expect(201)
      .then((res) => {
        assert.isString(res.body.token, 'response contains token');
        currentAuthHeader = `Bearer ${res.body.token}`;
        // make sure that token is VALID
        return checkToken(200);
      });
  });

  // logout and make sure that token cannot be used any more
  it('should revoke token and return 204', () => {
    return request(app)
      .del(endpoints.logout)
      .set('Authorization', currentAuthHeader)
      .expect(204)
      .then(() => {
        // make sure that token is INVALID
        return checkToken(401);
      });
  });

  it('should return 401 if auth header is empty', () => {
    return request(app)
      .del(endpoints.logout)
      .set('Authorization', '')
      .expect(401);
  });
});
