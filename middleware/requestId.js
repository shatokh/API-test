import crypto from 'crypto';

export const requestIdMiddleware = (req, res, next) => {
  const incomingId = req.header('x-request-id');
  const requestId = incomingId || crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  next();
};
