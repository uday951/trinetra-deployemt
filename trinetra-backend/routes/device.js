const express = require('express');
const router = express.Router();
const Device = require('../models/Device');

// Get Device Health
router.get('/health', (req, res) => {
  res.json({
    cpuUsage: Math.random() * 100,
    memoryUsage: Math.random() * 100,
    storageUsage: Math.random() * 100,
    batteryHealth: 85,
    temperature: 35 + Math.random() * 10,
    recommendations: [
      'Clear cache files',
      'Update system software',
      'Remove unused apps'
    ]
  });
});

// Get Device Location
router.get('/location', (req, res) => {
  res.json({
    latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
    longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
    accuracy: 10,
    timestamp: new Date().toISOString()
  });
});

// Optimize Device
router.post('/optimize', (req, res) => {
  res.json({
    cpuUsage: 30,
    memoryUsage: 45,
    storageUsage: 60,
    batteryHealth: 85,
    temperature: 35,
    recommendations: ['System optimized successfully']
  });
});

// Lock Device
router.post('/lock', async (req, res) => {
  const { deviceId } = req.body;
  await Device.findOneAndUpdate({ deviceId }, { status: 'locked', lastCommand: 'lock' });
  res.json({ success: true });
});

// Wipe Device
router.post('/wipe', async (req, res) => {
  const { deviceId } = req.body;
  await Device.findOneAndUpdate({ deviceId }, { status: 'wiped', lastCommand: 'wipe' });
  res.json({ success: true });
});

// Play Sound
router.post('/play-sound', (req, res) => {
  res.json({ success: true, message: 'Sound playing on device' });
});

// Get last location
router.get('/location/:deviceId', async (req, res) => {
  const device = await Device.findOne({ deviceId: req.params.deviceId });
  res.json({ location: device.lastLocation });
});

// Device posts location
router.post('/location', async (req, res) => {
  const { deviceId, lat, lng } = req.body;
  await Device.findOneAndUpdate(
    { deviceId },
    { lastLocation: { lat, lng, updatedAt: new Date() } }
  );
  res.json({ success: true });
});

module.exports = router; 