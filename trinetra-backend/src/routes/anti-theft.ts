import express, { Request, Response } from 'express';
import { Device } from '../models/Device';
import { WebSocketServer } from '../services/websocket';
import { Types } from 'mongoose';

let websocketServer: WebSocketServer;

export const initWebSocket = (server: any) => {
  websocketServer = new WebSocketServer(server);
};

const router = express.Router();

// Lock device
router.post('/lock', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    device.status = 'locked';
    await device.save();
    
    // Emit websocket event
    websocketServer.emitDeviceLock(deviceId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error locking device:', error);
    res.status(500).json({ error: 'Failed to lock device' });
  }
});

// Wipe device
router.post('/wipe', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    device.status = 'wiped';
    await device.save();
    
    // Emit websocket event
    websocketServer.emitDeviceWipe(deviceId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error wiping device:', error);
    res.status(500).json({ error: 'Failed to wipe device' });
  }
});

// Get device location
router.get('/location/:deviceId', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    
    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ 
      location: device.location ? {
        lat: device.location.latitude,
        lng: device.location.longitude
      } : null 
    });
  } catch (error) {
    console.error('Error getting device location:', error);
    res.status(500).json({ error: 'Failed to get device location' });
  }
});

// Update device location
router.post('/location', async (req: Request, res: Response) => {
  try {
    const { deviceId, lat, lng } = req.body;
    
    if (!deviceId || !lat || !lng) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    device.location = {
      latitude: lat,
      longitude: lng,
      lastUpdated: new Date()
    };
    await device.save();
    
    // Emit websocket event
    websocketServer.emitDeviceLocation(deviceId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating device location:', error);
    res.status(500).json({ error: 'Failed to update device location' });
  }
});

export default router;
