const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');
const UnauthorizedError = require('../errors/UnauthorizedError');

const { NODE_ENV, JWT_SECRET } = process.env;

const getUser = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }
    return res.send(user);
  } catch (err) {
    return next(err);
  }
};

const createUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashPassword,
    });
    return res.send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
    }
    if (err.code === 11000) {
      return next(new ConflictError('Email уже занят'));
    }
    return next(err);
  }
};

const editProfile = async (req, res, next) => {
  const userId = req.user._id;
  const { email, name } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { email, name },
      { new: true, runValidators: true },
    );
    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }
    return res.send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new BadRequestError('Переданы некорректные данные пользователя'));
    }
    if (err.code === 11000) {
      return next(new ConflictError('Email уже занят'));
    }
    return next(err);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new UnauthorizedError('Неверный email или пароль'));
    }
    const truePassword = await bcrypt.compare(password, user.password);
    if (!truePassword) {
      return next(new UnauthorizedError('Неверный email или пароль'));
    }

    const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'SECRET');

    res.cookie('jwt', token, {
      maxAge: 360000 * 24 * 7,
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });

    return res.send(user);
  } catch (err) {
    return next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie('jwt');
    return res.send();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getUser,
  createUser,
  editProfile,
  login,
  logout,
};
