// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
