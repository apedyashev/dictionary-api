const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Token = mongoose.model('Token');
const passport = require('passport');
const policies = require('../helpers/policies');
const errorHandler = require('../helpers/errorHandler');
const config = require('../config');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and authorization
 *
 * definitions:
 *   SuccessfulAuthResponse:
 *     required:
 *      - user
 *      - token
 *     properties:
 *       message:
 *         type: string
 *       token:
 *         type: string
 *       user:
 *         type: object
 *         $ref: '#/definitions/SerializedUser'
 */

/**
 * @swagger
 *
 * /auth/login:
 *   post:
 *     summary: Logs user in
 *     tags: [Auth]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: payload
 *         description: Endpoint's payload.
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/LoginPayload"
 *     responses:
 *       200:
 *         description: Ok
 *         schema:
 *           $ref: '#/definitions/SuccessfulAuthResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ResponseServerError'
 * definitions:
 *   LoginPayload:
 *     type: object
 *     required:
 *       - email
 *       - password
 *     properties:
 *       email:
 *         type: string
 *       password:
 *         type: string
 *
 */
router.post('/login', async (req, res) => {
  const {body: {email, password}} = req;
  const deviceId = req.device.type;

  try {
    const user = await User.findOne({email});
    if (!user) {
      return res.unauthorized('invalid credentials');
    }
    if (user.authenticate(password)) {
      const {token} = await Token.sign(user, deviceId);
      res.ok('login successfull', {token, user});
    } else {
      res.unauthorized('invalid credentials');
    }
  } catch (err) {
    errorHandler(res, 'login error')(err);
  }
});

/**
 * @swagger
 *
 * /auth/logout:
 *   delete:
 *     summary: Logs user out (invalidates token)
 *     tags: [Auth]
 *     produces:
 *       - application/json
 *     parameters:
 *       - $ref: "#/parameters/AuthorizationHeader"
 *     responses:
 *       204:
 *        description: Successful logout
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ResponseServerError'
 */
router.delete('/logout', policies.checkJwtAuth, async (req, res) => {
  try {
    await Token.invalidate(req.jwtToken);
    res.noContent();
  } catch (err) {
    errorHandler(res, 'logout error')(err);
  }
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registers a new user
 *     tags: [Auth]
 *     produces:
 *       - application/json
 *     parameters:
 *       - $ref: "#/parameters/AuthorizationHeader"
 *       - name: payload
 *         description: Endpoint's payload.
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/UserRegisterPayload"
 *     responses:
 *       201:
 *        description: Created
 *        schema:
 *          $ref: "#/definitions/SuccessfulAuthResponse"
 *       422:
 *         description: Validation error
 *         schema:
 *           $ref: "#/definitions/ValidationError"
 *       500:
 *         description: Server error
 * definitions:
 *   UserRegisterPayload:
 *     type: object
 *     required:
 *      - firstName
 *      - lastName
 *      - email
 *      - password
 *      - passwordConfirmation
 *     properties:
 *       firstName:
 *         type: string
 *       lastName:
 *         type: string
 *       email:
 *         type: string
 *       password:
 *         type: string
 *       passwordConfirmation:
 *         type: string
 */
router.post('/register', async (req, res) => {
  // do not allow to assign role by a user - use default one
  const roles = ['login'];
  const deviceId = req.device.type;

  try {
    const user = new User({...req.body, roles, provider: 'local'});
    await user.save();

    const {token} = await Token.sign(user, deviceId);
    res.created('user registered', {user, token});
  } catch (err) {
    errorHandler(res, 'register user error')(err);
  }
});

/**
 * @swagger
 *
 * /auth/facebook:
 *   get:
 *     summary: Redirects to facebook auth page
 *     description: Not intended to be called by AJAX
 *     tags: [Auth]
 *     responses:
 *       302:
 *        description: Redirects to facebook auth page
 */
router.get(
  '/facebook',
  passport.authenticate('facebook', {
    session: false,
    scope: ['email', 'public_profile'],
  })
);

/**
 * @swagger
 *
 * /auth/facebook/callback:
 *   post:
 *     summary: Callback for facebook auth.
 *     tags: [Auth]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: code
 *         description: Code returned by facebook after successful auth
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Ok
 *         schema:
 *           $ref: '#/definitions/SuccessfulAuthResponse'
 *       404:
 *         description: Not found (unlikely scenario)
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ResponseServerError'
 */
const {failureRedirect} = config.passport.facebook;
router.post(
  '/facebook/callback',
  passport.authenticate('facebook', {failureRedirect, session: false}),
  async (req, res) => {
    try {
      const deviceId = req.device.type;
      const {user} = req;
      if (user) {
        const {token} = await Token.sign(user, deviceId);
        res.ok('login successfull', {token, user});
      } else {
        res.notFound('user not found');
      }
    } catch (err) {
      errorHandler(res, 'register user error')(err);
    }
  }
);

/**
 * @swagger
 *
 * /auth/profile:
 *   get:
 *     summary: Returns user by token
 *     tags: [Auth]
 *     produces:
 *       - application/json
 *     parameters:
 *       - $ref: "#/parameters/AuthorizationHeader"
 *     responses:
 *       200:
 *         description: Ok
 *         properties:
 *           user:
 *             type: object
 *             $ref: '#/definitions/SerializedUser'
 */
router.get('/profile', policies.checkJwtAuth, async (req, res) => {
  const user = await User.findOne({_id: req.user.id});
  res.ok({user});
});

module.exports = (app) => {
  app.use('/auth', router);
};
