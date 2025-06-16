// validators/authValidators.js
const { body, param } = require('express-validator');
const User = require('../models/User');

// Валидатор регистрации
const registerValidator = [
  body('email')
    .isEmail().withMessage('Некорректный email')
    .custom(async email => {
      const exists = await User.findOne({ email });
      if (exists) throw new Error('Пользователь уже существует');
    }),
  body('password')
    .isLength({ min: 6 }).withMessage('Минимум 6 символов')
];

// Валидатор логина
const loginValidator = [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Пароль обязателен')
];

// Валидатор смены статуса
const setStatusValidator = [
  param('id').isMongoId().withMessage('Некорректный ID'),
  body('status').isIn(['active', 'inactive']).withMessage('Недопустимый статус')
];

module.exports = {
  registerValidator,
  loginValidator,
  setStatusValidator
};
