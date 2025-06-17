import { body, param } from 'express-validator';
import User from '../models/User.js';

// Валидатор регистрации
export const registerValidator = [
  body('email')
    .isEmail()
    .withMessage('Некорректный email')
    .custom(async (email) => {
      const exists = await User.findOne({ email });
      if (exists) {
        throw new Error('Пользователь уже существует');
      }
    }),
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Пароль должен быть от 6 до 100 символов'),
];

// Валидатор логина
export const loginValidator = [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Пароль обязателен'),
];

// Валидатор смены статуса
export const setStatusValidator = [
  param('id').isMongoId().withMessage('Некорректный ID'),
  body('status')
    .isIn(['active', 'inactive'])
    .withMessage('Недопустимый статус'),
];
