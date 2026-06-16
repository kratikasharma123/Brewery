import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { cleanString, isEmail, isPersonName, requireFields } from '../utils/validators.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
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

    const userExists = await User.findOne({ email: cleanString(email).toLowerCase() });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name: cleanString(name),
      email: cleanString(email).toLowerCase(),
      password,
      role: 'Customer',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
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
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password with registered email
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
