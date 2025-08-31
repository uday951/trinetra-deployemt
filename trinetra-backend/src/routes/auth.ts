import express, { Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Device } from '../models/Device';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Register new user
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['email', 'password', 'name'],
        received: { email: !!email, password: !!password, name: !!name }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format',
        received: email
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Log successful registration
    console.log('User registered successfully:', {
      id: user._id,
      email: user.email,
      name: user.name
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Error registering user',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Login user
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['email', 'password'],
        received: { email: !!email, password: !!password }
      });
    }

    console.log('Login attempt for email:', email);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Login failed: Invalid password for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get user's devices
    const devices = await Device.find({ userId: user._id });

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('Login successful:', {
      userId: user._id,
      email: user.email,
      devicesCount: devices.length
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      devices: devices.map(device => ({
        id: device._id,
        name: device.name,
        status: device.status,
        lastSeen: device.lastSeen,
      })),
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error logging in',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Register new device
router.post('/device/register', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { deviceId, name } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if device already exists
    const existingDevice = await Device.findOne({ deviceId });
    if (existingDevice) {
      return res.status(400).json({ message: 'Device already registered' });
    }

    // Create new device
    const device = new Device({
      deviceId,
      name,
      userId,
    });

    await device.save();

    // Add device to user's devices array
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
  } catch (error: any) {
    console.error('Device registration error:', error);
    res.status(500).json({
      message: 'Error registering device',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Change password
router.post('/change-password', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['currentPassword', 'newPassword']
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log('Password changed successfully for user:', user.email);

    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Error changing password',
      error: error.message
    });
  }
});

export default router; 