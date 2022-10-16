require('dotenv').config();
const express = require('express');
const router = require('express').Router();
const cookieParser = require('cookie-parser');

const { createUser, login, logout } = require('../controllers/users');

const auth = require('../middlewares/auth');
const { validationCreateUser, validationLoginUser } = require('../middlewares/validations');
const { requestLogger, errorLogger } = require('../middlewares/logger');

const NotFoundError = require('../errors/NotFoundError');

const userRouter = require('./users');
const movieRouter = require('./movies');

router.use(express.json());

router.use(cookieParser());

router.use(requestLogger);

router.post('/signup', validationCreateUser, createUser);
router.post('/signin', validationLoginUser, login);
router.get('/signout', logout);

router.use(auth);

router.use(auth, userRouter);
router.use(auth, movieRouter);

router.use((req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

router.use(errorLogger);

module.exports = router;
