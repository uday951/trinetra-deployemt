const os = require('os');
const si = require('systeminformation');
const Device = require('../models/Device');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const AndroidDeviceService = require('../services/androidDeviceService');

// Get device health
exports.getHealth = async (req, res) => {
  try {
    const device = await Device.findOne({ owner: req.user._id });
    if (!device) {
      return res.status(404).json({
        error: 'Device not found',
        message: 'No device found for this user'
      });
    }

    const metrics = await AndroidDeviceService.getDeviceMetrics(device._id);
    
    // Update device performance metrics in database
    await Device.findByIdAndUpdate(device._id, {
      'performance.cpuUsage': metrics.cpu.usage,
      'performance.memoryUsage': (metrics.memory.used / metrics.memory.total) * 100,
      'performance.storageUsage': (metrics.storage.internal.used / metrics.storage.internal.total) * 100,
      'performance.batteryLevel': metrics.battery.level,
      'performance.temperature': metrics.cpu.temperature,
      'performance.lastUpdate': new Date()
    });

    res.json(metrics);
  } catch (error) {
    console.error('Error getting device health:', error);
    res.status(500).json({ 
      error: 'Failed to get device health',
      message: error.message 
    });
  }
};

// Optimize device
exports.optimizeDevice = async (req, res) => {
  try {
    const device = await Device.findOne({ owner: req.user._id });
    if (!device) {
      return res.status(404).json({
        error: 'Device not found',
        message: 'No device found for this user'
      });
    }

    const optimizationResult = await AndroidDeviceService.optimizeDevice(device._id);
    
    // Update device optimization history
    await Device.findByIdAndUpdate(device._id, {
      $push: {
        'commands': {
          type: 'optimize',
          status: 'completed',
          issuedAt: new Date(),
          completedAt: new Date(),
          details: optimizationResult.optimizationSteps
        }
      },
      lastCommand: 'optimize',
      lastCommandTime: new Date()
    });

    res.json(optimizationResult);
  } catch (error) {
    console.error('Error optimizing device:', error);
    res.status(500).json({ 
      error: 'Failed to optimize device',
      message: error.message 
    });
  }
};

// Get installed apps
exports.getInstalledApps = async (req, res) => {
  try {
    const device = await Device.findOne({ owner: req.user._id });
    if (!device) {
      return res.status(404).json({
        error: 'Device not found',
        message: 'No device found for this user'
      });
    }

    const apps = await AndroidDeviceService.getInstalledApps(device._id);
    res.json(apps);
  } catch (error) {
    console.error('Error getting installed apps:', error);
    res.status(500).json({ 
      error: 'Failed to get installed apps',
      message: error.message 
    });
  }
};

// Get security status
exports.getSecurityStatus = async (req, res) => {
  try {
    const device = await Device.findOne({ owner: req.user._id });
    if (!device) {
      return res.status(404).json({
        error: 'Device not found',
        message: 'No device found for this user'
      });
    }

    const securityStatus = await AndroidDeviceService.getSecurityStatus(device._id);
    
    // Update device security status in database
    await Device.findByIdAndUpdate(device._id, {
      'security.lastScan': new Date(),
      'security.threats': securityStatus.malwareScanner.threats,
      'security.encryptionEnabled': securityStatus.encryption.enabled,
      'security.isRooted': securityStatus.rootStatus.isRooted
    });

    res.json(securityStatus);
  } catch (error) {
    console.error('Error getting security status:', error);
    res.status(500).json({ 
      error: 'Failed to get security status',
      message: error.message 
    });
  }
};

// Get maintenance status
exports.getMaintenanceStatus = async (req, res) => {
  try {
    const device = await Device.findOne({ owner: req.user._id });
    if (!device) {
      return res.status(404).json({
        error: 'Device not found',
        message: 'No device found for this user'
      });
    }

    const recommendations = await AndroidDeviceService.getMaintenanceRecommendations(device._id);
    const metrics = await AndroidDeviceService.getDeviceMetrics(device._id);

    res.json({
      recommendations,
      metrics,
      lastMaintenance: device.lastMaintenance
    });
  } catch (error) {
    console.error('Error getting maintenance status:', error);
    res.status(500).json({ 
      error: 'Failed to get maintenance status',
      message: error.message 
    });
  }
};

// Get device info
exports.getDeviceInfo = async (req, res) => {
  try {
    const device = await Device.findOne({ owner: req.user._id });
    if (!device) {
      return res.status(404).json({
        error: 'Device not found',
        message: 'No device found for this user'
      });
    }

    // Return the actual device document (with real info)
    res.json(device);
  } catch (error) {
    console.error('Error getting device info:', error);
    res.status(500).json({ 
      error: 'Failed to get device information',
      message: error.message 
    });
  }
};

// Lock device
exports.lockDevice = async (req, res) => {
  try {
    const device = await Device.findOneAndUpdate(
      { owner: req.user._id },
      { 
        $push: {
          'commands': {
            type: 'lock',
            status: 'pending',
            issuedAt: new Date()
          }
        },
        status: 'locked',
        lastCommand: 'lock',
        lastCommandTime: new Date()
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        error: 'Device not found',
        message: 'No device found for this user'
      });
    }

    // Here you would typically send a push notification to the device
    // to actually lock it. For now, we'll just update the status.

    res.json({
      success: true,
      message: 'Device lock command sent successfully',
      device: {
        id: device._id,
        status: device.status,
        lastCommand: device.lastCommand,
        lastCommandTime: device.lastCommandTime
      }
    });
  } catch (error) {
    console.error('Error locking device:', error);
    res.status(500).json({ 
      error: 'Failed to lock device',
      message: error.message 
    });
  }
};

// Wipe device
exports.wipeDevice = async (req, res) => {
  try {
    const device = await Device.findOneAndUpdate(
      { owner: req.user._id },
      { 
        $push: {
          'commands': {
            type: 'wipe',
            status: 'pending',
            issuedAt: new Date()
          }
        },
        status: 'wiping',
        lastCommand: 'wipe',
        lastCommandTime: new Date()
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        error: 'Device not found',
        message: 'No device found for this user'
      });
    }

    // Here you would typically send a push notification to the device
    // to initiate the wipe. For now, we'll just update the status.

    res.json({
      success: true,
      message: 'Device wipe command sent successfully',
      device: {
        id: device._id,
        status: device.status,
        lastCommand: device.lastCommand,
        lastCommandTime: device.lastCommandTime
      }
    });
  } catch (error) {
    console.error('Error wiping device:', error);
    res.status(500).json({ 
      error: 'Failed to initiate device wipe',
      message: error.message 
    });
  }
};

// Play sound
exports.playSound = async (req, res) => {
  try {
    const device = await Device.findOneAndUpdate(
      { owner: req.user._id },
      { 
        $push: {
          'commands': {
            type: 'play_sound',
            status: 'pending',
            issuedAt: new Date()
          }
        },
        lastCommand: 'play_sound',
        lastCommandTime: new Date()
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        error: 'Device not found',
        message: 'No device found for this user'
      });
    }

    // Here you would typically send a push notification to the device
    // to play a sound. For now, we'll just acknowledge the command.

    res.json({
      success: true,
      message: 'Play sound command sent successfully',
      device: {
        id: device._id,
        lastCommand: device.lastCommand,
        lastCommandTime: device.lastCommandTime
      }
    });
  } catch (error) {
    console.error('Error sending play sound command:', error);
    res.status(500).json({ 
      error: 'Failed to send play sound command',
      message: error.message 
    });
  }
};

// Get device location
exports.getLocation = async (req, res) => {
  try {
    const device = await Device.findOne({ owner: req.user._id });
    if (!device || !device.location) {
      return res.status(404).json({
        error: 'Location not found',
        message: 'Device location is not available'
      });
    }

    res.json({
      latitude: device.location.latitude,
      longitude: device.location.longitude,
      accuracy: 10,
      timestamp: device.location.lastUpdated || new Date()
    });
  } catch (error) {
    console.error('Error getting device location:', error);
    res.status(500).json({ 
      error: 'Failed to get device location',
      message: error.message 
    });
  }
};

// Update device location
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Invalid location',
        message: 'Latitude and longitude are required'
      });
    }

    const device = await Device.findOneAndUpdate(
      { owner: req.user._id },
      { 
        location: {
          latitude,
          longitude,
          lastUpdated: new Date()
        }
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        error: 'Device not found',
        message: 'No device found for this user'
      });
    }

    res.json({
      success: true,
      location: device.location
    });
  } catch (error) {
    console.error('Error updating device location:', error);
    res.status(500).json({ 
      error: 'Failed to update device location',
      message: error.message 
    });
  }
}; 