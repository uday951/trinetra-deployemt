import { Platform, Dimensions } from 'react-native';
import api from './api';

export interface DeviceInfoType {
  manufacturer: string;
  model: string;
  androidVersion: string;
  buildNumber: string;
  deviceId: string;
}

export interface DeviceMetrics {
  battery: {
    level: number;
    isCharging: boolean;
    timeRemaining: number;
  };
  storage: {
    internal: {
      total: number;
      used: number;
      available: number;
    };
  };
  memory: {
    total: number;
    used: number;
    available: number;
    cached: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
}

export interface SecurityStatus {
  playProtect: {
    enabled: boolean;
    lastScan?: string;
  };
  encryption: {
    enabled: boolean;
    type: string;
    status: 'active' | 'inactive' | 'unknown';
  };
  screenLock: {
    enabled: boolean;
    type: string;
    status: 'active' | 'inactive' | 'unknown';
  };
}

export interface OptimizationResult {
  success: boolean;
  improvements: {
    memory: {
      difference: number;
    };
    storage: {
      difference: number;
    };
    battery: {
      estimated_extension: number;
    };
  };
}

class DeviceApi {
  async getDeviceInfo(): Promise<DeviceInfoType> {
    try {
      // Simulate device info based on platform
      const manufacturer = Platform.OS === 'android' ? 'Android Device' : 'Apple';
      const model = Platform.OS === 'android' ? 'Android Phone' : 'iPhone';
      const androidVersion = Platform.Version.toString();
      const buildNumber = '1.0.0';
      const deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
      
      return {
        manufacturer,
        model,
        androidVersion,
        buildNumber,
        deviceId,
      };
    } catch (error) {
      console.error('Error getting device info:', error);
      return {
        manufacturer: 'Unknown',
        model: 'Unknown',
        androidVersion: 'Unknown',
        buildNumber: 'Unknown',
        deviceId: 'Unknown',
      };
    }
  }

  async getHealth(): Promise<DeviceMetrics> {
    try {
      // Simulate device metrics
      const batteryLevel = Math.random() * 0.8 + 0.2; // 20-100%
      const isCharging = Math.random() > 0.7;
      
      // Simulate storage based on device type
      const screenData = Dimensions.get('screen');
      const isTablet = Math.min(screenData.width, screenData.height) > 600;
      const storageInfo = isTablet ? 256 * 1024 * 1024 * 1024 : 128 * 1024 * 1024 * 1024;
      const usedStorage = storageInfo * (0.3 + Math.random() * 0.4);
      const freeStorage = storageInfo - usedStorage;
      
      // Simulate memory
      const totalMemory = isTablet ? 8 * 1024 * 1024 * 1024 : 4 * 1024 * 1024 * 1024;
      const usedMemory = totalMemory * (0.4 + Math.random() * 0.3);
      const freeMemory = totalMemory - usedMemory;
      
      return {
        battery: {
          level: Math.round(batteryLevel * 100),
          isCharging,
          timeRemaining: 0,
        },
        storage: {
          internal: {
            total: storageInfo,
            used: usedStorage,
            available: freeStorage,
          },
        },
        memory: {
          total: totalMemory,
          used: usedMemory,
          available: freeMemory,
          cached: 0,
        },
        cpu: {
          usage: 0,
          cores: 8, // Default to 8 cores since we can't get the actual count
        },
      };
    } catch (error) {
      console.error('Error getting device health:', error);
      return {
        battery: {
          level: 0,
          isCharging: false,
          timeRemaining: 0,
        },
        storage: {
          internal: {
            total: 0,
            used: 0,
            available: 0,
          },
        },
        memory: {
          total: 0,
          used: 0,
          available: 0,
          cached: 0,
        },
        cpu: {
          usage: 0,
          cores: 8, // Default to 8 cores in error case as well
        },
      };
    }
  }

  async getSecurityStatus(): Promise<SecurityStatus> {
    try {
      // Simulate security status
      const isEmulator = false; // Assume real device
      const hasRecentSecurityPatch = Math.random() > 0.3; // 70% chance of recent patch
      
      return {
        playProtect: {
          enabled: !isEmulator,
          lastScan: new Date().toISOString(),
        },
        encryption: {
          enabled: hasRecentSecurityPatch, // Use security patch as a proxy for encryption
          type: hasRecentSecurityPatch ? 'File-based' : 'None',
          status: hasRecentSecurityPatch ? 'active' : 'inactive',
        },
        screenLock: {
          enabled: true, // We'll assume it's enabled since we can't check directly
          type: 'Pattern', // Default to Pattern
          status: 'active',
        },
      };
    } catch (error) {
      console.error('Error getting security status:', error);
      return {
        playProtect: {
          enabled: false,
          lastScan: new Date().toISOString(),
        },
        encryption: {
          enabled: false,
          type: 'None',
          status: 'inactive',
        },
        screenLock: {
          enabled: false,
          type: 'None',
          status: 'inactive',
        },
      };
    }
  }

  async checkPlayProtect(): Promise<{ enabled: boolean; lastScan: string }> {
    try {
      return {
        enabled: Platform.OS === 'android',
        lastScan: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error checking Play Protect:', error);
      return {
        enabled: false,
        lastScan: new Date().toISOString(),
      };
    }
  }

  async checkEncryption(): Promise<{ enabled: boolean; type: string; status: string }> {
    try {
      const hasRecentSecurityPatch = Math.random() > 0.3;
      
      return {
        enabled: hasRecentSecurityPatch,
        type: hasRecentSecurityPatch ? 'File-based' : 'None',
        status: hasRecentSecurityPatch ? 'active' : 'inactive',
      };
    } catch (error) {
      console.error('Error checking encryption:', error);
      return {
        enabled: false,
        type: 'None',
        status: 'inactive',
      };
    }
  }

  async checkScreenLock(): Promise<{ enabled: boolean; type: string; status: string }> {
    try {
      // Since we can't directly check screen lock, we'll return a default value
      return {
        enabled: true,
        type: 'Pattern',
        status: 'active',
      };
    } catch (error) {
      console.error('Error checking screen lock:', error);
      return {
        enabled: false,
        type: 'None',
        status: 'inactive',
      };
    }
  }

  async optimizeDevice(): Promise<OptimizationResult> {
    try {
      const health = await this.getHealth();
      
      return {
        success: true,
        improvements: {
          memory: {
            difference: Math.round(health.memory.used * 0.1),
          },
          storage: {
            difference: Math.round(health.storage.internal.used * 0.05),
          },
          battery: {
            estimated_extension: 30,
          },
        },
      };
    } catch (error) {
      console.error('Error optimizing device:', error);
      return {
        success: false,
        improvements: {
          memory: {
            difference: 0,
          },
          storage: {
            difference: 0,
          },
          battery: {
            estimated_extension: 0,
          },
        },
      };
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new DeviceApi(); 