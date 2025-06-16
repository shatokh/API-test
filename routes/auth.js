//auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  registerValidator,
  loginValidator,
  setStatusValidator
} = require('../validators/authValidators');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Аутентификация и авторизация
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Успешно зарегистрирован
 */
router.post('/register', registerValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashed });

  res.status(201).json({ message: 'User created', userId: user._id });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Авторизация
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT токен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */
router.post('/login', loginValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Информация о текущем пользователе
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Текущий пользователь
 *       401:
 *         description: Неавторизован
 */
router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
});

/**
 * @swagger
 * /api/auth/users/{id}/status:
 *   patch:
 *     summary: Админ меняет статус пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       204:
 *         description: Статус обновлён
 *       403:
 *         description: Запрещено
 *       404:
 *         description: Пользователь не найден
 */
router.patch('/users/:id/status',
  authMiddleware,
  roleMiddleware('admin'),
  setStatusValidator,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (target.role !== 'user') return res.status(403).json({ error: 'Cannot change non-user' });

    target.status = req.body.status;
    await target.save();
    res.status(204).end();
  }
);

module.exports = router;