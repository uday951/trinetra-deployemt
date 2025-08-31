const si = require('systeminformation');
const Device = require('../models/Device');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class DeviceService {
  // Get real-time device health metrics
  static async getDeviceHealth(deviceId) {
    try {
      const [cpu, mem, temp, battery, disk] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.cpuTemperature(),
        si.battery(),
        si.fsSize()
      ]);

      const device = await Device.findById(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      const healthMetrics = {
        cpu: {
          usage: cpu.currentLoad,
          temperature: temp.main,
          cores: cpu.cpus ? cpu.cpus.length : null
        },
        memory: {
          total: mem.total,
          used: mem.used,
          free: mem.free,
          usagePercent: ((mem.used / mem.total) * 100).toFixed(2)
        },
        storage: {
          total: disk[0].size,
          used: disk[0].used,
          free: disk[0].free,
          usagePercent: ((disk[0].used / disk[0].size) * 100).toFixed(2)
        },
        battery: {
          level: battery.percent,
          isCharging: battery.isCharging,
          timeRemaining: battery.timeRemaining
        }
      };

      // Update device performance metrics
      await Device.findByIdAndUpdate(deviceId, {
        'performance.cpuUsage': healthMetrics.cpu.usage,
        'performance.memoryUsage': healthMetrics.memory.usagePercent,
        'performance.storageUsage': healthMetrics.storage.usagePercent,
        'performance.batteryLevel': healthMetrics.battery.level,
        'performance.temperature': healthMetrics.cpu.temperature,
        'performance.lastUpdate': new Date()
      });

      return healthMetrics;
    } catch (error) {
      console.error('Error getting device health:', error);
      throw error;
    }
  }

  // Optimize device performance
  static async optimizeDevice(deviceId) {
    try {
      const beforeMetrics = await this.getDeviceHealth(deviceId);
      const optimizationSteps = [];

      // Get running processes
      const processes = await si.processes();
      const highCpuProcesses = processes.list
        .filter(p => p.cpu > 50)
        .slice(0, 5);

      // Memory optimization
      if (beforeMetrics.memory.usagePercent > 80) {
        await this.clearMemoryCache();
        optimizationSteps.push('Cleared memory cache');
      }

      // Storage optimization
      if (beforeMetrics.storage.usagePercent > 80) {
        await this.clearTemporaryFiles();
        optimizationSteps.push('Cleared temporary files');
      }

      // Process optimization
      if (highCpuProcesses.length > 0) {
        optimizationSteps.push(`High CPU processes identified: ${highCpuProcesses.map(p => p.name).join(', ')}`);
      }

      const afterMetrics = await this.getDeviceHealth(deviceId);

      return {
        beforeMetrics,
        afterMetrics,
        improvements: {
          cpu: (beforeMetrics.cpu.usage - afterMetrics.cpu.usage).toFixed(2),
          memory: (beforeMetrics.memory.usagePercent - afterMetrics.memory.usagePercent).toFixed(2),
          storage: (beforeMetrics.storage.usagePercent - afterMetrics.storage.usagePercent).toFixed(2)
        },
        optimizationSteps
      };
    } catch (error) {
      console.error('Error optimizing device:', error);
      throw error;
    }
  }

  // Clear memory cache
  static async clearMemoryCache() {
    if (process.platform === 'win32') {
      await execAsync('powershell -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"');
      await execAsync('powershell -Command "Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue"');
    } else {
      await execAsync('sync && echo 3 > /proc/sys/vm/drop_caches');
    }
  }

  // Clear temporary files
  static async clearTemporaryFiles() {
    if (process.platform === 'win32') {
      await execAsync('del /F /Q %temp%\\*');
    } else {
      await execAsync('rm -rf /tmp/*');
    }
  }

  // Get installed apps
  static async getInstalledApps(deviceId) {
    try {
      const device = await Device.findById(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      const apps = await si.programs();
      return apps.map(app => ({
        name: app.name,
        version: app.version,
        installDate: app.installDate,
        publisher: app.publisher,
        size: app.size
      }));
    } catch (error) {
      console.error('Error getting installed apps:', error);
      throw error;
    }
  }

  // Get security status
  static async getSecurityStatus(deviceId) {
    try {
      const device = await Device.findById(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      const [firewall, antivirus] = await Promise.all([
        this.checkFirewallStatus(),
        this.checkAntivirusStatus()
      ]);

      return {
        firewall,
        antivirus,
        lastScan: device.security.lastScan,
        threats: device.security.threats,
        encryptionEnabled: device.security.encryptionEnabled,
        isRooted: device.security.isRooted
      };
    } catch (error) {
      console.error('Error getting security status:', error);
      throw error;
    }
  }

  // Check firewall status
  static async checkFirewallStatus() {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('netsh advfirewall show allprofiles state');
        return {
          enabled: stdout.includes('ON'),
          profiles: {
            domain: stdout.includes('Domain Profile') ? 'ON' : 'OFF',
            private: stdout.includes('Private Profile') ? 'ON' : 'OFF',
            public: stdout.includes('Public Profile') ? 'ON' : 'OFF'
          }
        };
      }
      return { enabled: true, profiles: {} }; // Default for non-Windows
    } catch (error) {
      console.error('Error checking firewall status:', error);
      return { enabled: false, error: error.message };
    }
  }

  // Check antivirus status
  static async checkAntivirusStatus() {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('powershell -Command "Get-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled"');
        return {
          enabled: stdout.includes('True'),
          realTimeProtection: stdout.includes('RealTimeProtectionEnabled : True')
        };
      }
      return { enabled: false }; // Default for non-Windows
    } catch (error) {
      console.error('Error checking antivirus status:', error);
      return { enabled: false, error: error.message };
    }
  }

  // Get maintenance status
  static async getMaintenanceStatus(deviceId) {
    try {
      const device = await Device.findById(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      const [updates, disk] = await Promise.all([
        this.checkSystemUpdates(),
        si.fsSize()
      ]);

      return {
        systemUpdates: updates,
        storage: {
          total: disk[0].size,
          free: disk[0].free,
          used: disk[0].used,
          health: ((disk[0].free / disk[0].size) * 100).toFixed(2)
        },
        lastMaintenance: device.lastMaintenance,
        recommendations: await this.getMaintenanceRecommendations(deviceId)
      };
    } catch (error) {
      console.error('Error getting maintenance status:', error);
      throw error;
    }
  }

  // Check system updates
  static async checkSystemUpdates() {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('powershell -Command "Get-WindowsUpdate"');
        return {
          available: stdout.split('\n').length - 1,
          critical: stdout.includes('Important'),
          lastChecked: new Date()
        };
      }
      return { available: 0, critical: false, lastChecked: new Date() }; // Default for non-Windows
    } catch (error) {
      console.error('Error checking system updates:', error);
      return { error: error.message };
    }
  }

  // Get maintenance recommendations
  static async getMaintenanceRecommendations(deviceId) {
    const recommendations = [];
    const metrics = await this.getDeviceHealth(deviceId);

    if (metrics.cpu.usage > 80) {
      recommendations.push({
        type: 'cpu',
        priority: 'high',
        message: 'High CPU usage detected. Consider closing resource-intensive applications.'
      });
    }

    if (metrics.memory.usagePercent > 80) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: 'High memory usage detected. Clear browser cache and close unused applications.'
      });
    }

    if (metrics.storage.usagePercent > 80) {
      recommendations.push({
        type: 'storage',
        priority: 'medium',
        message: 'Storage space is running low. Consider cleaning up unnecessary files.'
      });
    }

    if (metrics.battery.level < 20) {
      recommendations.push({
        type: 'battery',
        priority: 'high',
        message: 'Battery level is low. Connect to a power source.'
      });
    }

    return recommendations;
  }
}

module.exports = DeviceService; 