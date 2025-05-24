import os from 'os';

export interface SystemInfo {
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  batteryHealth: number;
  temperature: number;
  recommendations: string[];
}

export class SystemInfoService {
  async getSystemInfo(): Promise<SystemInfo> {
    // Mock system information
    return {
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      storageUsage: Math.random() * 100,
      batteryHealth: Math.random() * 100,
      temperature: Math.random() * 80,
      recommendations: [
        'Consider closing unused applications',
        'Update your system software',
        'Run a virus scan'
      ]
    };
  }

  async optimizeSystem(): Promise<SystemInfo> {
    // Mock system optimization
    return {
      cpuUsage: Math.random() * 50,
      memoryUsage: Math.random() * 50,
      storageUsage: Math.random() * 50,
      batteryHealth: Math.random() * 100,
      temperature: Math.random() * 40,
      recommendations: [
        'System optimized successfully',
        'Keep monitoring system performance'
      ]
    };
  }
} 