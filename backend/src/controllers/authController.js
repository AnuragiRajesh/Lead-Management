const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc  Register a new user
// @route POST /api/auth/register
// @access Public
const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email and password' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, password, role });

  const token = generateToken(user._id, user.role);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

// @desc  Login
// @route POST /api/auth/login
// @access Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(user._id, user.role);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

// @desc  Logout
// @route POST /api/auth/logout
// @access Private
const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};

// @desc  Get current user
// @route GET /api/auth/me
// @access Private
const getMe = (req, res) => {
  res.json({ user: req.user });
};

// @desc  Get all users (for assignment dropdown)
// @route GET /api/auth/users
// @access Admin only
const getUsers = async (req, res) => {
  const users = await User.find().select('_id name email role').sort({ name: 1 });
  res.json(users);
};

module.exports = { register, login, logout, getMe, getUsers };
