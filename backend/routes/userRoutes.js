import express from 'express';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { protect, admin } from '../middleware/authMiddleware.js';

console.log('userRoutes.js loaded and executing!');

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
router.post('/register', async (req, res) => {
  console.log('--- REGISTER REQUEST RECEIVED ---');
  console.log('Request Body:', req.body);
  console.log('Content-Type Header:', req.headers['content-type']);
  console.log('--- END REGISTER REQUEST ---');

  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
router.post('/login', async (req, res) => {
  console.log('--- LOGIN REQUEST RECEIVED ---');
  console.log('Request Body:', req.body);
  console.log('Content-Type Header:', req.headers['content-type']);
  console.log('--- END LOGIN REQUEST ---');

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (requires authentication)
router.get('/profile', protect, async (req, res) => {
  console.log('--- PROFILE ROUTE HIT ---'); // <--- THIS LINE IS NOW INCLUDED
  console.log('User from token:', req.user ? req.user.email : 'No user found'); // NEW LOG

  // req.user is available here because of the 'protect' middleware
  if (req.user) {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
    });
  } else {
    res.status(404).json({ message: 'User not found or not authorized' });
  }
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin (requires authentication and admin status)
router.get('/', protect, admin, async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

export default router;
