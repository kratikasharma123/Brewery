import jwt from 'jsonwebtoken';
import { adminAuth } from '../config/firebaseAdmin.js';
import User from '../models/User.js';

const getBearerToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
};

const getUserFromFirebaseToken = async (token) => {
  if (!adminAuth) return null;

  const decoded = await adminAuth.verifyIdToken(token);
  const email = decoded.email?.toLowerCase();

  return User.findOne({
    isActive: { $ne: false },
    $or: [
      { firebaseUid: decoded.uid },
      ...(email ? [{ email }] : []),
    ],
  }).select('-password');
};

const getUserFromJwtToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  return User.findOne({
    _id: decoded.id,
    isActive: { $ne: false },
  }).select('-password');
};

// Protect routes with Firebase ID token first, legacy JWT second
export const protect = async (req, res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    let user = null;

    try {
      user = await getUserFromFirebaseToken(token);
    } catch {
      user = null;
    }

    if (!user) {
      user = await getUserFromJwtToken(token);
    }

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user?.role || 'Guest'}' is not authorized to access this route`,
      });
    }
    next();
  };
};
