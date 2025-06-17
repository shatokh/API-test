// middleware/roleMiddleware.js
export default function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    if (req.userRole !== requiredRole) {
      return res.status(403).json({ error: 'Access denied for this role' });
    }
    next();
  };
}
