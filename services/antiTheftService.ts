import * as Location from 'expo-location';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/env';

export interface DeviceLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  deviceId: string;
}

export interface AntiTheftConfig {
  isEnabled: boolean;
  trackingInterval: number;
  autoLockOnTheft: boolean;
  soundAlarmOnTheft: boolean;
  emergencyContacts: string[];
}

class AntiTheftService {
  private trackingInterval: NodeJS.Timeout | null = null;
  private config: AntiTheftConfig = {
    isEnabled: true,
    trackingInterval: 30000, // 30 seconds
    autoLockOnTheft: false,
    soundAlarmOnTheft: true,
    emergencyContacts: [],
  };

  async initialize() {
    await this.loadConfig();
    if (this.config.isEnabled) {
      await this.startTracking();
    }
  }

  async loadConfig() {
    try {
      const savedConfig = await AsyncStorage.getItem('antiTheftConfig');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.error('Error loading anti-theft config:', error);
    }
  }

  async saveConfig() {
    try {
      await AsyncStorage.setItem('antiTheftConfig', JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving anti-theft config:', error);
    }
  }

  async startTracking() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    // Initial location
    await this.updateLocation();

    // Set up periodic tracking
    this.trackingInterval = setInterval(async () => {
      await this.updateLocation();
    }, this.config.trackingInterval);
  }

  stopTracking() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  async updateLocation() {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const deviceLocation: DeviceLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
        accuracy: location.coords.accuracy || undefined,
        deviceId: Device.osInternalBuildId || 'unknown',
      };

      await this.sendLocationToServer(deviceLocation);
      await this.saveLastKnownLocation(deviceLocation);

      return deviceLocation;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  async sendLocationToServer(location: DeviceLocation) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/anti-theft/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(location),
      });

      if (!response.ok) {
        throw new Error('Failed to send location to server');
      }
    } catch (error) {
      console.error('Error sending location to server:', error);
      // Store locally if server is unavailable
      await this.storeLocationOffline(location);
    }
  }

  async storeLocationOffline(location: DeviceLocation) {
    try {
      const offlineLocations = await AsyncStorage.getItem('offlineLocations');
      const locations = offlineLocations ? JSON.parse(offlineLocations) : [];
      locations.push(location);
      
      // Keep only last 100 locations
      if (locations.length > 100) {
        locations.splice(0, locations.length - 100);
      }
      
      await AsyncStorage.setItem('offlineLocations', JSON.stringify(locations));
    } catch (error) {
      console.error('Error storing location offline:', error);
    }
  }

  async saveLastKnownLocation(location: DeviceLocation) {
    try {
      await AsyncStorage.setItem('lastKnownLocation', JSON.stringify(location));
    } catch (error) {
      console.error('Error saving last known location:', error);
    }
  }

  async getLastKnownLocation(): Promise<DeviceLocation | null> {
    try {
      const location = await AsyncStorage.getItem('lastKnownLocation');
      return location ? JSON.parse(location) : null;
    } catch (error) {
      console.error('Error getting last known location:', error);
      return null;
    }
  }

  async lockDevice() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/anti-theft/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: Device.osInternalBuildId || 'unknown',
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to lock device');
      }

      return true;
    } catch (error) {
      console.error('Error locking device:', error);
      throw error;
    }
  }

  async wipeDevice() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/anti-theft/wipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: Device.osInternalBuildId || 'unknown',
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to wipe device');
      }

      return true;
    } catch (error) {
      console.error('Error wiping device:', error);
      throw error;
    }
  }

  async soundAlarm() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/anti-theft/alarm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: Device.osInternalBuildId || 'unknown',
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sound alarm');
      }

      return true;
    } catch (error) {
      console.error('Error sounding alarm:', error);
      throw error;
    }
  }

  async enableProtection() {
    this.config.isEnabled = true;
    await this.saveConfig();
    await this.startTracking();
  }

  async disableProtection() {
    this.config.isEnabled = false;
    await this.saveConfig();
    this.stopTracking();
  }

  getConfig() {
    return { ...this.config };
  }

  async updateConfig(newConfig: Partial<AntiTheftConfig>) {
    this.config = { ...this.config, ...newConfig };
    await this.saveConfig();
    
    if (this.config.isEnabled) {
      await this.startTracking();
    } else {
      this.stopTracking();
    }
  }
}

export const antiTheftService = new AntiTheftService();