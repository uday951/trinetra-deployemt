export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: string;
}

export class LocationTracker {
  private lastLocation: LocationData = {
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: new Date().toISOString()
  };

  async getCurrentLocation(): Promise<LocationData> {
    // Mock location data
    this.lastLocation = {
      latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
      longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
      accuracy: Math.random() * 100,
      timestamp: new Date().toISOString()
    };
    return this.lastLocation;
  }

  async getLastKnownLocation(): Promise<LocationData> {
    return this.lastLocation;
  }
} 