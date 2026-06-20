import jwt from 'jsonwebtoken';
import { adminAuth } from '../config/firebaseAdmin.js';
import User from '../models/User.js';
import { cleanString, isEmail, isPersonName, requireFields } from '../utils/validators.js';

// Generate legacy JWT token for existing non-Firebase users
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const getBearerToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
};

const serializeUser = (user, token) => ({
  _id: user._id,
  firebaseUid: user.firebaseUid,
  name: user.name,
  email: user.email,
  role: user.role,
  token,
});

// @desc    Register or load a Firebase authenticated user profile
// @route   POST /api/auth/firebase-sync
// @access  Private via Firebase ID token
export const syncFirebaseUser = async (req, res, next) => {
  try {
    if (!adminAuth) {
      res.status(500);
      throw new Error('Firebase Admin is not configured on the server');
    }

    const token = getBearerToken(req);
    if (!token) {
      res.status(401);
      throw new Error('Firebase token is required');
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const email = decoded.email?.toLowerCase();

    if (!email || !isEmail(email)) {
      res.status(400);
      throw new Error('Firebase account must include a valid email address');
    }

    const requestedRole = req.body.role ? cleanString(req.body.role) : undefined;
    const allowedRoles = ['Admin', 'Customer'];

    if (requestedRole && !allowedRoles.includes(requestedRole)) {
      res.status(400);
      throw new Error('Please select Admin or Customer');
    }

    let user = await User.findOne({
      $or: [{ firebaseUid: decoded.uid }, { email }],
    });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: cleanString(req.body.name || decoded.name || email.split('@')[0]),
        email,
        role: requestedRole || 'Customer',
      });
    } else {
      user.firebaseUid ||= decoded.uid;
      if (req.body.name) user.name = cleanString(req.body.name);
      if (requestedRole) user.role = requestedRole;
      await user.save();
    }

    res.json(serializeUser(user, token));
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new legacy user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    requireFields(req.body, ['name', 'email', 'password']);
    const { name, email, password } = req.body;

    if (!isEmail(email)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }

    if (!isPersonName(name)) {
      res.status(400);
      throw new Error('Name can contain letters and spaces only');
    }

    if (String(password).length < 8) {
      res.status(400);
      throw new Error('Password must be at least 8 characters');
    }

    const requestedRole = cleanString(req.body.role || 'Customer');
    const allowedRoles = ['Admin', 'Customer'];

    if (!allowedRoles.includes(requestedRole)) {
      res.status(400);
      throw new Error('Please select Admin or Customer');
    }

    const userExists = await User.findOne({ email: cleanString(email).toLowerCase() });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name: cleanString(name),
      email: cleanString(email).toLowerCase(),
      password,
      role: requestedRole,
    });

    if (user) {
      res.status(201).json(serializeUser(user, generateToken(user._id)));
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Choose account role after registration
// @route   PATCH /api/auth/role
// @access  Private
export const chooseUserRole = async (req, res, next) => {
  try {
    const role = cleanString(req.body.role);
    const allowedRoles = ['Admin', 'Customer'];

    if (!allowedRoles.includes(role)) {
      res.status(400);
      throw new Error('Please select Admin or Customer');
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.role = role;
    await user.save();

    res.json(serializeUser(user, getBearerToken(req) || generateToken(user._id)));
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate legacy user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    requireFields(req.body, ['email', 'password']);
    const { email, password } = req.body;

    const user = await User.findOne({
      email: cleanString(email).toLowerCase(),
      isActive: { $ne: false },
    }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json(serializeUser(user, generateToken(user._id)));
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password with registered email for legacy users
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    requireFields(req.body, ['email', 'password']);
    const { email, password } = req.body;

    if (!isEmail(email)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }

    if (String(password).length < 8) {
      res.status(400);
      throw new Error('Password must be at least 8 characters');
    }

    const user = await User.findOne({
      email: cleanString(email).toLowerCase(),
      isActive: { $ne: false },
    }).select('+password');

    if (!user) {
      res.status(404);
      throw new Error('No active account found with this email');
    }

    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successfully. You can sign in now.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};
