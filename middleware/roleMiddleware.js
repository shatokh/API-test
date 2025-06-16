// roleMiddleware.js
module.exports = requiredRole => (req, res, next) => {
  if (req.userRole !== requiredRole) {
    return res.status(403).json({ error: 'Access denied for this role' });
  }
  next();
};
