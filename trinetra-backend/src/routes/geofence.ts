import express, { Request, Response } from 'express';
import { Geofence } from '../models/Geofence';
import { geofenceService } from '../services/geofenceService';

const router = express.Router();

interface Location {
  latitude: number;
  longitude: number;
}

interface GeofenceData {
  userId: string;
  deviceId: string;
  name: string;
  radius: number;
  location: Location;
  enabled: boolean;
}

// Create geofence
router.post('/', async (req: Request, res: Response) => {
  try {
    const geofenceData: GeofenceData = req.body;
    
    if (!geofenceData.userId || !geofenceData.deviceId || !geofenceData.location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const geofence = await Geofence.create(geofenceData);
    res.status(201).json(geofence);
  } catch (error) {
    console.error('Error creating geofence:', error);
    res.status(500).json({ message: 'Failed to create geofence' });
  }
});

// Get geofences for user/device
router.get('/:userId/:deviceId', async (req: Request, res: Response) => {
  try {
    const { userId, deviceId } = req.params;
    
    if (!userId || !deviceId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const geofences = await geofenceService.getGeofences(userId, deviceId);
    res.json(geofences);
  } catch (error) {
    console.error('Error fetching geofences:', error);
    res.status(500).json({ message: 'Failed to fetch geofences' });
  }
});

// Update geofence
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const geofenceData: Partial<GeofenceData> = req.body;
    const geofence = await Geofence.findByIdAndUpdate(
      req.params.id,
      geofenceData,
      { new: true }
    );

    if (!geofence) {
      return res.status(404).json({ message: 'Geofence not found' });
    }

    res.json(geofence);
  } catch (error) {
    console.error('Error updating geofence:', error);
    res.status(500).json({ message: 'Failed to update geofence' });
  }
});

// Delete geofence
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const geofence = await Geofence.findByIdAndDelete(req.params.id);
    
    if (!geofence) {
      return res.status(404).json({ message: 'Geofence not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting geofence:', error);
    res.status(500).json({ message: 'Failed to delete geofence' });
  }
});

// Check if location is within geofence
router.post('/check', async (req: Request, res: Response) => {
  try {
    const { userId, deviceId, location } = req.body;
    
    if (!userId || !deviceId || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await geofenceService.checkGeofence(
      userId,
      deviceId,
      location.latitude,
      location.longitude
    );

    res.json(result);
  } catch (error) {
    console.error('Error checking geofence:', error);
    res.status(500).json({ message: 'Failed to check geofence' });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

export default router; 