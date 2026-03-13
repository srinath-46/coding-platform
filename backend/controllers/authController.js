const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/jwtToken');

const authController = {
  register: async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }

      const existingUser = await User.findByEmail(email) || await User.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userId = await User.create(username, email, hashedPassword);
      const user = await User.findById(userId);

      const token = generateToken({ id: user.id, username: user.username, is_admin: user.is_admin });

      res.status(201).json({
        success: true,
        token,
        user
      });
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken({ id: user.id, username: user.username, is_admin: user.is_admin });

      const userData = await User.findById(user.id);

      res.status(200).json({
        success: true,
        token,
        user: userData
      });
    } catch (err) {
      next(err);
    }
  },

  getMe: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      res.status(200).json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
