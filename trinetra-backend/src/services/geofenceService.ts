import { Geofence, IGeofence } from '../models/Geofence';

export class GeofenceService {
  async getGeofences(userId: string, deviceId: string): Promise<IGeofence[]> {
    return await Geofence.find({ userId, deviceId, enabled: true });
  }

  async checkGeofence(userId: string, deviceId: string, latitude: number, longitude: number): Promise<{
    inViolation: boolean;
    violations: Array<{
      name: string;
      location: { latitude: number; longitude: number };
      radius: number;
    }>;
  }> {
    const geofences = await this.getGeofences(userId, deviceId);
    const violations = geofences.filter(fence => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        fence.location.latitude,
        fence.location.longitude
      );
      return distance <= fence.radius;
    });

    return {
      inViolation: violations.length > 0,
      violations: violations.map(v => ({
        name: v.name,
        location: v.location,
        radius: v.radius
      }))
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
}

export const geofenceService = new GeofenceService(); 