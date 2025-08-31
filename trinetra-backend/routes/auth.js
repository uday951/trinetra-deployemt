const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Input validation middleware
const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email) errors.email = 'Email is required';
  if (!password) errors.password = 'Password is required';
  
  if (email && !/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateRegisterInput = (req, res, next) => {
  const { email, password, name } = req.body;
  const errors = {};

  if (!email) errors.email = 'Email is required';
  if (!password) errors.password = 'Password is required';
  if (!name) errors.name = 'Name is required';

  if (email && !/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (password && password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// Login route
router.post('/login', validateLoginInput, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password field explicitly selected
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send response without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while logging in'
    });
  }
});

// Register route
router.post('/register', validateRegisterInput, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Registration failed',
        message: 'Email is already registered'
      });
    }

    // Create user
    const user = new User({
      email,
      password, // Will be hashed by the pre-save middleware
      name,
      role: 'user'
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send response without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while registering'
    });
  }
});

// Get current user route
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'User not found'
      });
    }

    res.json({ user });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid token'
      });
    }
    
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while fetching user data'
    });
  }
});

// Register new device
const authMiddleware = require('../server').authMiddleware || ((req, res, next) => next()); // fallback if not exported
router.post('/device/register', authMiddleware, async (req, res) => {
  try {
    const { deviceId, name } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if device already exists
    const Device = require('../models/Device');
    const existingDevice = await Device.findOne({ deviceId });
    if (existingDevice) {
      return res.status(400).json({ message: 'Device already registered' });
    }

    // Create new device
    const device = new Device({
      deviceId,
      name,
      owner: userId,
    });

    await device.save();

    // Add device to user's devices array
    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, {
      $push: { devices: device._id },
    });

    res.status(201).json({
      device: {
        id: device._id,
        deviceId: device.deviceId,
        name: device.name,
        status: device.status,
      },
    });
  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({
      message: 'Error registering device',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Change password route
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Current password and new password are required'
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'New password must be at least 6 characters long'
      });
    }

    // Verify token and get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('+password');
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'User not found'
      });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        error: 'Invalid password',
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    console.log('Password changed successfully for user:', user.email);

    res.json({ 
      success: true,
      message: 'Password changed successfully' 
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid token'
      });
    }
    
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while changing password'
    });
  }
});

module.exports = router; 