import express from 'express';
import { DeviceLocation } from '../models/DeviceLocation';
import { AntiTheftAction } from '../models/AntiTheftAction';

const router = express.Router();

// Store device location
router.post('/location', async (req, res) => {
  try {
    const { latitude, longitude, timestamp, accuracy, deviceId } = req.body;

    const location = new DeviceLocation({
      deviceId,
      latitude,
      longitude,
      timestamp: new Date(timestamp),
      accuracy,
      createdAt: new Date(),
    });

    await location.save();

    res.json({ 
      success: true, 
      message: 'Location updated successfully',
      locationId: location._id 
    });
  } catch (error) {
    console.error('Error storing location:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to store location' 
    });
  }
});

// Get device location history
router.get('/location/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit = 50 } = req.query;

    const locations = await DeviceLocation
      .find({ deviceId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit as string));

    res.json({
      success: true,
      locations,
      count: locations.length
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch locations' 
    });
  }
});

// Get latest device location
router.get('/location/:deviceId/latest', async (req, res) => {
  try {
    const { deviceId } = req.params;

    const location = await DeviceLocation
      .findOne({ deviceId })
      .sort({ timestamp: -1 });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'No location found for device'
      });
    }

    res.json({
      success: true,
      location
    });
  } catch (error) {
    console.error('Error fetching latest location:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch latest location' 
    });
  }
});

// Lock device
router.post('/lock', async (req, res) => {
  try {
    const { deviceId, timestamp } = req.body;

    const action = new AntiTheftAction({
      deviceId,
      action: 'lock',
      timestamp: new Date(timestamp),
      status: 'pending',
      createdAt: new Date(),
    });

    await action.save();

    // Here you would implement the actual device locking logic
    // This could involve sending a push notification or using device management APIs

    res.json({
      success: true,
      message: 'Device lock command sent',
      actionId: action._id
    });
  } catch (error) {
    console.error('Error locking device:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to lock device' 
    });
  }
});

// Wipe device
router.post('/wipe', async (req, res) => {
  try {
    const { deviceId, timestamp } = req.body;

    const action = new AntiTheftAction({
      deviceId,
      action: 'wipe',
      timestamp: new Date(timestamp),
      status: 'pending',
      createdAt: new Date(),
    });

    await action.save();

    // Here you would implement the actual device wiping logic
    // This is a critical operation that should have additional security measures

    res.json({
      success: true,
      message: 'Device wipe command sent',
      actionId: action._id
    });
  } catch (error) {
    console.error('Error wiping device:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to wipe device' 
    });
  }
});

// Sound alarm
router.post('/alarm', async (req, res) => {
  try {
    const { deviceId, timestamp } = req.body;

    const action = new AntiTheftAction({
      deviceId,
      action: 'alarm',
      timestamp: new Date(timestamp),
      status: 'pending',
      createdAt: new Date(),
    });

    await action.save();

    // Here you would implement the actual alarm logic
    // This could involve playing a loud sound or triggering device notifications

    res.json({
      success: true,
      message: 'Alarm command sent',
      actionId: action._id
    });
  } catch (error) {
    console.error('Error sounding alarm:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to sound alarm' 
    });
  }
});

// Get device actions history
router.get('/actions/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit = 20 } = req.query;

    const actions = await AntiTheftAction
      .find({ deviceId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit as string));

    res.json({
      success: true,
      actions,
      count: actions.length
    });
  } catch (error) {
    console.error('Error fetching actions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch actions' 
    });
  }
});

// Update action status
router.patch('/actions/:actionId/status', async (req, res) => {
  try {
    const { actionId } = req.params;
    const { status } = req.body;

    const action = await AntiTheftAction.findByIdAndUpdate(
      actionId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!action) {
      return res.status(404).json({
        success: false,
        message: 'Action not found'
      });
    }

    res.json({
      success: true,
      action
    });
  } catch (error) {
    console.error('Error updating action status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update action status' 
    });
  }
});

export default router;