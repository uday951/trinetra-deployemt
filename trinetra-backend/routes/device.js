const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const authMiddleware = require('../server').authMiddleware || ((req, res, next) => next()); // fallback if not exported

// Device health and status
router.get('/health', deviceController.getHealth);
router.get('/info', deviceController.getDeviceInfo);
router.get('/security', deviceController.getSecurityStatus);
router.get('/maintenance', deviceController.getMaintenanceStatus);

// Device optimization
router.post('/optimize', deviceController.optimizeDevice);

// Device control
router.post('/lock', deviceController.lockDevice);
router.post('/wipe', deviceController.wipeDevice);
router.post('/play-sound', deviceController.playSound);

// Device apps
router.get('/apps', deviceController.getInstalledApps);

// Device location
router.get('/location', deviceController.getLocation);
router.post('/location', deviceController.updateLocation);

// Update device info from mobile app
router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { deviceId, ...deviceData } = req.body;
    const Device = require('../models/Device');
    const device = await Device.findOneAndUpdate(
      { deviceId, owner: req.user._id },
      { $set: deviceData },
      { new: true }
    );
    if (!device) return res.status(404).json({ error: 'Device not found' });
    res.json({ success: true, device });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 