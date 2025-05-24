import express, { Request, Response } from 'express';
import { ChildLock } from '../models/ChildLock';
import { SafeApp } from '../models/SafeApp';
import { Device } from '../models/Device';

const router = express.Router();

// Get user's devices
async function getUserDevices(userId: string): Promise<string[]> {
  const devices = await Device.find({ userId });
  return devices.map(d => d._id.toString());
}

// Validate request body
function validateRequest(body: any, requiredFields: string[]): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter(field => !body[field]);
  return {
    valid: missing.length === 0,
    missing
  };
}

// Lock/Unlock device
router.post('/lock', async (req: Request, res: Response) => {
  try {
    const validation = validateRequest(req.body, ['userId', 'deviceId', 'action']);
    if (!validation.valid) {
      return res.status(400).json({
        message: 'Missing required fields',
        missing: validation.missing
      });
    }

    const { userId, deviceId, action } = req.body;

    // Validate action
    if (!['lock', 'unlock'].includes(action)) {
      return res.status(400).json({
        message: 'Invalid action. Must be either "lock" or "unlock"',
        received: action
      });
    }

    // Update device status
    const device = await Device.findOneAndUpdate(
      { _id: deviceId, userId },
      { 
        'status': action === 'lock' ? 'locked' : 'active',
        'settings.childLockEnabled': action === 'lock'
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        message: 'Device not found',
        userId,
        deviceId
      });
    }

    // Update child lock settings
    const childLock = await ChildLock.findOneAndUpdate(
      { userId, deviceId },
      { enabled: action === 'lock' },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      device,
      childLock,
      message: `Device successfully ${action}ed`
    });
  } catch (error) {
    console.error('Error managing device lock:', error);
    res.status(500).json({
      message: 'Failed to manage device lock',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Check device lock status
router.get('/status/:deviceId', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: 'Missing required parameter',
        missing: ['userId']
      });
    }

    const device = await Device.findOne({ _id: deviceId, userId });
    if (!device) {
      return res.status(404).json({
        message: 'Device not found',
        deviceId
      });
    }

    const childLock = await ChildLock.findOne({ userId, deviceId });
    const safeApps = await SafeApp.find({ 
      userId, 
      deviceId,
      enabled: true 
    });

    res.json({
      isLocked: device.status === 'locked',
      childLockEnabled: device.settings.childLockEnabled,
      childLockSettings: childLock || { enabled: false, restrictions: [] },
      safeApps: safeApps.map(app => ({
        id: app.id,
        appName: app.appName,
        packageName: app.packageName
      }))
    });
  } catch (error) {
    console.error('Error checking device status:', error);
    res.status(500).json({
      message: 'Failed to check device status',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Set child lock settings
router.post('/settings', async (req: Request, res: Response) => {
  try {
    const validation = validateRequest(req.body, ['userId', 'deviceId']);
    if (!validation.valid) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missing: validation.missing 
      });
    }

    const { userId, deviceId, enabled, restrictions } = req.body;

    // Update device settings
    const device = await Device.findOneAndUpdate(
      { _id: deviceId, userId },
      { 'settings.childLockEnabled': enabled },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        message: 'Device not found',
        userId,
        deviceId
      });
    }

    const settings = await ChildLock.findOneAndUpdate(
      { userId, deviceId },
      { enabled, restrictions },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      settings,
      device: {
        id: device._id,
        status: device.status,
        settings: device.settings
      }
    });
  } catch (error) {
    console.error('Error setting child lock:', error);
    res.status(500).json({ 
      message: 'Failed to set child lock settings',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get child lock settings
router.get('/settings', async (req: Request, res: Response) => {
  try {
    const { userId, deviceId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        message: 'Missing required parameter', 
        missing: ['userId'] 
      });
    }

    if (deviceId) {
      // Get settings for specific device
      const [settings, device] = await Promise.all([
        ChildLock.findOne({ userId, deviceId }),
        Device.findOne({ _id: deviceId, userId })
      ]);

      if (!device) {
        return res.status(404).json({
          message: 'Device not found',
          deviceId
        });
      }

      res.json({
        settings: settings || { enabled: false, restrictions: [] },
        device: {
          id: device._id,
          status: device.status,
          settings: device.settings
        }
      });
    } else {
      // Get settings for all user's devices
      const devices = await getUserDevices(userId.toString());
      const [settings, deviceDetails] = await Promise.all([
        ChildLock.find({ userId, deviceId: { $in: devices } }),
        Device.find({ _id: { $in: devices } })
      ]);

      res.json({
        settings,
        devices: deviceDetails.map(device => ({
          id: device._id,
          status: device.status,
          settings: device.settings
        }))
      });
    }
  } catch (error) {
    console.error('Error getting child lock settings:', error);
    res.status(500).json({ 
      message: 'Failed to get child lock settings',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get safe apps for a user's device
router.get('/safeapps/:userId/:deviceId?', async (req: Request, res: Response) => {
  try {
    const { userId, deviceId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        message: 'Missing required parameter', 
        missing: ['userId'] 
      });
    }

    if (deviceId) {
      // Get safe apps for specific device
      const device = await Device.findOne({ _id: deviceId, userId });
      if (!device) {
        return res.status(404).json({
          message: 'Device not found',
          deviceId
        });
      }

      const settings = await ChildLock.findOne({ userId, deviceId });
      const safeApps = await SafeApp.find({ 
        userId,
        deviceId,
        enabled: true
      }).sort({ appName: 1 });

      res.json({
        safeApps,
        deviceStatus: {
          isLocked: device.status === 'locked',
          childLockEnabled: device.settings.childLockEnabled,
          childLockSettings: settings || { enabled: false, restrictions: [] }
        }
      });
    } else {
      // Get safe apps for all user's devices
      const devices = await getUserDevices(userId);
      const safeApps = await SafeApp.find({ 
        userId, 
        deviceId: { $in: devices },
        enabled: true 
      }).sort({ appName: 1 });

      res.json({ safeApps });
    }
  } catch (error) {
    console.error('Error getting safe apps:', error);
    res.status(500).json({ 
      message: 'Failed to get safe apps',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Add a safe app
router.post('/safeapps', async (req: Request, res: Response) => {
  try {
    console.log('Received request to add safe app:', req.body);
    
    const validation = validateRequest(req.body, ['userId', 'deviceId', 'appName', 'packageName']);
    if (!validation.valid) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missing: validation.missing,
        received: req.body 
      });
    }

    const { userId, deviceId, appName, packageName } = req.body;

    // Check if device exists and is valid for this user
    const device = await Device.findOne({ _id: deviceId, userId });
    if (!device) {
      return res.status(404).json({ 
        message: 'Device not found or does not belong to user',
        userId,
        deviceId
      });
    }

    // Check if app already exists
    const existingApp = await SafeApp.findOne({ userId, deviceId, packageName });
    if (existingApp) {
      // If app exists but disabled, re-enable it
      if (!existingApp.enabled) {
        existingApp.enabled = true;
        await existingApp.save();
        return res.json({
          success: true,
          message: 'App re-enabled in safe list',
          app: existingApp
        });
      }
      return res.status(409).json({ 
        message: 'App already exists in safe list',
        app: existingApp
      });
    }

    const safeApp = await SafeApp.create({
      userId,
      deviceId,
      appName,
      packageName,
      enabled: true
    });

    res.status(201).json({
      success: true,
      message: 'App added to safe list',
      app: safeApp
    });
  } catch (error) {
    console.error('Error adding safe app:', error);
    res.status(500).json({ 
      message: 'Failed to add safe app',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Remove a safe app
router.delete('/safeapps/:id', async (req: Request, res: Response) => {
  try {
    const safeApp = await SafeApp.findByIdAndUpdate(
      req.params.id,
      { enabled: false },
      { new: true }
    );
    
    if (!safeApp) {
      return res.status(404).json({ 
        message: 'Safe app not found',
        id: req.params.id
      });
    }

    res.json({ 
      success: true, 
      message: 'App removed from safe list',
      removed: safeApp 
    });
  } catch (error) {
    console.error('Error removing safe app:', error);
    res.status(500).json({ 
      message: 'Failed to remove safe app',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Delete child lock settings
router.delete('/settings', async (req: Request, res: Response) => {
  try {
    const { userId, deviceId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        message: 'Missing required parameter', 
        missing: ['userId'] 
      });
    }

    if (deviceId) {
      // Delete settings for specific device
      const [settings, device] = await Promise.all([
        ChildLock.findOneAndDelete({ userId, deviceId }),
        Device.findOneAndUpdate(
          { _id: deviceId, userId },
          { 
            'settings.childLockEnabled': false,
            status: 'active'
          },
          { new: true }
        )
      ]);

      res.json({ 
        success: true, 
        message: 'Child lock settings deleted and device unlocked',
        deleted: settings ? 1 : 0,
        device: device ? {
          id: device._id,
          status: device.status,
          settings: device.settings
        } : null
      });
    } else {
      // Delete settings for all user's devices
      const devices = await getUserDevices(userId.toString());
      const [deleteResult, updatedDevices] = await Promise.all([
        ChildLock.deleteMany({ userId, deviceId: { $in: devices } }),
        Device.updateMany(
          { _id: { $in: devices } },
          { 
            'settings.childLockEnabled': false,
            status: 'active'
          }
        )
      ]);

      res.json({ 
        success: true, 
        message: 'Child lock settings deleted and devices unlocked',
        deleted: deleteResult.deletedCount,
        devicesUpdated: updatedDevices.modifiedCount
      });
    }
  } catch (error) {
    console.error('Error deleting child lock settings:', error);
    res.status(500).json({ 
      message: 'Failed to delete child lock settings',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router; 