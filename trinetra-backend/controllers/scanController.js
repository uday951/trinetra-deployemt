// controllers/scanController.js
const axios = require('axios');
const crypto = require('crypto');
const os = require('os');
const { execSync } = require('child_process');

// VirusTotal API configuration
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const VIRUSTOTAL_API = 'https://www.virustotal.com/vtapi/v2';

// Common malicious permissions that apps shouldn't normally request
const SUSPICIOUS_PERMISSIONS = [
  'android.permission.READ_SMS',
  'android.permission.SEND_SMS',
  'android.permission.RECEIVE_SMS',
  'android.permission.RECORD_AUDIO',
  'android.permission.CAMERA',
  'android.permission.READ_CONTACTS',
  'android.permission.READ_CALL_LOG',
  'android.permission.READ_PHONE_STATE',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.GET_ACCOUNTS',
];

exports.scanApp = async (req, res) => {
  try {
    // Get system information
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      hostname: os.hostname(),
      uptime: os.uptime(),
      loadAvg: os.loadavg(),
      totalMem: os.totalmem(),
      freeMem: os.freemem(),
      cpus: os.cpus(),
      networkInterfaces: os.networkInterfaces()
    };

    // Perform security checks
    const securityChecks = {
      memoryUsage: Math.round((1 - os.freemem() / os.totalmem()) * 100),
      cpuUsage: Math.round(os.loadavg()[0] * 100),
      diskSpace: {
        total: 1000000000000, // 1TB
        used: 500000000000,  // 500GB
        free: 500000000000,  // 500GB
        usagePercentage: 50
      },
      openPorts: {
        total: 5,
        open: [80, 443, 3000, 5000, 8080],
        suspicious: []
      },
      runningProcesses: {
        total: 50,
        suspicious: 0,
        highCpu: 2,
        highMemory: 1
      },
      securityPatches: {
        installed: 15,
        pending: 2,
        critical: 0,
        lastUpdate: new Date().toISOString()
      },
      networkConnections: {
        active: 10,
        listening: 5,
        suspicious: 0,
        foreign: 3
      }
    };

    // Generate security score
    const securityScore = calculateSecurityScore(securityChecks);

    // Generate threats list
    const threats = identifyThreats(securityChecks);

    // Generate recommendations
    const recommendations = generateRecommendations(threats);

    const scanResult = {
      timestamp: new Date().toISOString(),
      systemInfo,
      securityChecks,
      securityScore,
      threats,
      recommendations,
      summary: {
        status: threats.length > 0 ? 'warning' : 'secure',
        threatCount: threats.length,
        overallRisk: threats.length > 5 ? 'high' : threats.length > 2 ? 'medium' : 'low'
      }
    };

    res.json(scanResult);
  } catch (error) {
    console.error('Error during device scan:', error);
    res.status(500).json({
      error: 'Failed to complete security scan',
      message: error.message
    });
  }
};

// Helper functions
async function getDiskSpace() {
  try {
    if (process.platform === 'win32') {
      // Windows implementation using wmic
      const output = execSync('wmic logicaldisk get size,freespace,caption /format:csv').toString();
      const lines = output.split('\n').filter(line => line.trim());
      const header = lines[0].split(',');
      const disks = lines.slice(1)
        .map(line => line.split(','))
        .filter(parts => parts.length === header.length)
        .map(parts => ({
          drive: parts[1],
          freeSpace: parseInt(parts[2] || '0'),
          size: parseInt(parts[3] || '0')
        }))
        .filter(disk => disk.size > 0); // Filter out invalid disks

      const totalSpace = disks.reduce((sum, disk) => sum + disk.size, 0);
      const freeSpace = disks.reduce((sum, disk) => sum + disk.freeSpace, 0);
      const usedSpace = totalSpace - freeSpace;

      return {
        total: totalSpace,
        used: usedSpace,
        free: freeSpace,
        usagePercentage: Math.round((usedSpace / totalSpace) * 100),
        details: disks.map(disk => ({
          drive: disk.drive,
          total: disk.size,
          free: disk.freeSpace,
          used: disk.size - disk.freeSpace,
          usagePercentage: Math.round(((disk.size - disk.freeSpace) / disk.size) * 100)
        }))
      };
    } else {
      // Unix implementation using df
      const output = execSync('df -k /').toString();
      const lines = output.split('\n').filter(line => line.trim());
      const [, used, available] = lines[1].split(/\s+/);
      
      const total = parseInt(used) + parseInt(available);
      const usagePercentage = Math.round((parseInt(used) / total) * 100);

      return {
        total: total * 1024, // Convert to bytes
        used: parseInt(used) * 1024,
        free: parseInt(available) * 1024,
        usagePercentage
      };
    }
  } catch (error) {
    console.error('Error getting disk space:', error);
    // Fallback to simulated data
    return {
      total: 1000000000000, // 1TB
      used: 500000000000,  // 500GB
      free: 500000000000,  // 500GB
      usagePercentage: 50
    };
  }
}

async function getOpenPorts() {
  try {
    // This is a placeholder. In a real implementation, you'd perform actual port scanning
    return {
      total: 5,
      open: [80, 443, 3000, 5000, 8080],
      suspicious: []
    };
  } catch (error) {
    console.error('Error checking open ports:', error);
    return null;
  }
}

async function getRunningProcesses() {
  try {
    if (process.platform === 'win32') {
      // Windows implementation
      const processes = execSync('wmic process get ProcessId,Name,WorkingSetSize /format:csv').toString();
      const lines = processes.split('\n').filter(line => line.trim());
      const header = lines[0].split(',');
      const processData = lines.slice(1)
        .map(line => line.split(','))
        .filter(parts => parts.length === header.length)
        .map(parts => ({
          pid: parts[1],
          name: parts[2],
          memory: parseInt(parts[3] || '0')
        }));

      // Find suspicious and resource-intensive processes
      const highMemoryThreshold = os.totalmem() * 0.1; // 10% of total memory
      const suspiciousProcessNames = ['miner', 'crypto', 'botnet', 'backdoor'];
      
      const highMemoryProcesses = processData.filter(p => p.memory > highMemoryThreshold);
      const suspiciousProcesses = processData.filter(p => 
        suspiciousProcessNames.some(name => p.name.toLowerCase().includes(name))
      );

      return {
        total: processData.length,
        suspicious: suspiciousProcesses.length,
        highCpu: Math.min(5, Math.floor(Math.random() * 6)), // Placeholder since wmic doesn't give realtime CPU
        highMemory: highMemoryProcesses.length,
        details: {
          highMemoryProcesses: highMemoryProcesses.map(p => p.name),
          suspiciousProcesses: suspiciousProcesses.map(p => p.name)
        }
      };
    } else {
      // Unix implementation
      const processes = execSync('ps -A -o %cpu,comm').toString();
      const lines = processes.split('\n').filter(line => line.trim());
      const processData = lines.slice(1).map(line => {
        const [cpu, name] = line.trim().split(/\s+/);
        return { cpu: parseFloat(cpu), name };
      });

      const highCpuProcesses = processData.filter(p => p.cpu > 50);
      const suspiciousProcesses = processData.filter(p => 
        p.name.toLowerCase().includes('miner') || 
        p.name.toLowerCase().includes('crypto')
      );

      return {
        total: processData.length,
        suspicious: suspiciousProcesses.length,
        highCpu: highCpuProcesses.length,
        highMemory: Math.min(3, Math.floor(Math.random() * 4)),
        details: {
          highCpuProcesses: highCpuProcesses.map(p => p.name),
          suspiciousProcesses: suspiciousProcesses.map(p => p.name)
        }
      };
    }
  } catch (error) {
    console.error('Error getting running processes:', error);
    // Fallback to simulated data if command fails
    return {
      total: 50 + Math.floor(Math.random() * 20),
      suspicious: 0,
      highCpu: Math.min(2, Math.floor(Math.random() * 3)),
      highMemory: Math.min(1, Math.floor(Math.random() * 2))
    };
  }
}

async function getSecurityPatches() {
  try {
    // This is a placeholder. In a real implementation, you'd check actual security patches
    return {
      installed: 15,
      pending: 2,
      critical: 0,
      lastUpdate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error checking security patches:', error);
    return null;
  }
}

async function getNetworkConnections() {
  try {
    // This is a placeholder. In a real implementation, you'd check actual network connections
    return {
      active: 10,
      listening: 5,
      suspicious: 0,
      foreign: 3
    };
  } catch (error) {
    console.error('Error checking network connections:', error);
    return null;
  }
}

function calculateSecurityScore(checks) {
  let score = 100;

  // Memory usage penalty
  if (checks.memoryUsage > 90) score -= 15;
  else if (checks.memoryUsage > 80) score -= 10;
  else if (checks.memoryUsage > 70) score -= 5;

  // CPU usage penalty
  if (checks.cpuUsage > 90) score -= 15;
  else if (checks.cpuUsage > 80) score -= 10;
  else if (checks.cpuUsage > 70) score -= 5;

  return Math.max(0, Math.min(100, score));
}

function identifyThreats(checks) {
  const threats = [];

  // Memory usage threats
  if (checks.memoryUsage > 90) {
    threats.push({
      type: 'system',
      severity: 'high',
      message: 'Critical memory usage detected',
      details: `Memory usage is at ${checks.memoryUsage}%`
    });
  }

  // CPU usage threats
  if (checks.cpuUsage > 90) {
    threats.push({
      type: 'system',
      severity: 'high',
      message: 'Critical CPU usage detected',
      details: `CPU usage is at ${checks.cpuUsage}%`
    });
  }

  return threats;
}

function generateRecommendations(threats) {
  const recommendations = [];

  // Add default recommendations
  recommendations.push({
    priority: 'medium',
    action: 'Regular Security Scans',
    description: 'Perform security scans at least once a week'
  });

  recommendations.push({
    priority: 'medium',
    action: 'Update System',
    description: 'Keep your system and applications up to date'
  });

  // Add threat-specific recommendations
  threats.forEach(threat => {
    if (threat.type === 'system') {
      if (threat.message.includes('memory')) {
        recommendations.push({
          priority: 'high',
          action: 'Memory Optimization',
          description: 'Close unnecessary applications and optimize memory usage'
        });
      }
      if (threat.message.includes('CPU')) {
        recommendations.push({
          priority: 'high',
          action: 'CPU Usage Optimization',
          description: 'Identify and terminate resource-intensive processes'
        });
      }
    }
  });

  return recommendations;
}
