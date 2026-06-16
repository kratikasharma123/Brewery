const requestBuckets = new Map();

export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
};

export const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 300 } = {}) => {
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const bucket = requestBuckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt <= now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    requestBuckets.set(key, bucket);

    if (bucket.count > max) {
      return res.status(429).json({ message: 'Too many requests. Please try again shortly.' });
    }

    return next();
  };
};
