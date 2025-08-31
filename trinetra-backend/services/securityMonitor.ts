import { EventEmitter } from 'events';
import ThreatScannerService from './threatScanner';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import { networkInterfaces } from 'os';

const execAsync = promisify(exec);

interface SecurityEvent {
  type: 'app_scan' | 'network_activity' | 'permission_change' | 'system_alert';
  severity: 'low' | 'medium' | 'high';
  details: {
    message: string;
    error?: string;
    processes?: Array<{
      name: string;
      memory?: string;
      details?: string;
    }>;
    connection?: {
      localAddress: string;
      remoteAddress: string;
      state: string;
    };
    interface?: string;
    connections?: number;
    ipAddress?: string;
    details?: string;
    process?: string;
  };
  timestamp: Date;
}

interface ProcessInfo {
  pid: string;
  name: string;
  memory: number;
}

interface NetworkConnection {
  localAddress: string;
  remoteAddress: string;
  state: string;
}

class SecurityMonitorService extends EventEmitter {
  private static instance: SecurityMonitorService;
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private threatScanner: ThreatScannerService;
  private securityEvents: SecurityEvent[] = [];
  private readonly MAX_EVENTS = 100;

  private constructor() {
    super();
    this.threatScanner = ThreatScannerService.getInstance();
  }

  public static getInstance(): SecurityMonitorService {
    if (!SecurityMonitorService.instance) {
      SecurityMonitorService.instance = new SecurityMonitorService();
    }
    return SecurityMonitorService.instance;
  }

  public startMonitoring(interval: number = 10000): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      try {
        const events = await this.checkSecurity();
        const timestamp = new Date();
        events.forEach(event => {
          const securityEvent: SecurityEvent = {
            ...event,
            timestamp
          };
          this.securityEvents.unshift(securityEvent);
          
          // Keep only the last MAX_EVENTS events
          if (this.securityEvents.length > this.MAX_EVENTS) {
            this.securityEvents.pop();
          }
          
          // Emit events
          this.emit('security_event', securityEvent);
          if (event.severity === 'high') {
            this.emit('high_risk_alert', securityEvent);
          }
        });
      } catch (error) {
        console.error('Error during security check:', error);
      }
    }, interval);

    console.log('Security monitoring started');
  }

  public stopMonitoring(): void {
    if (!this.isMonitoring || !this.monitoringInterval) {
      return;
    }

    clearInterval(this.monitoringInterval);
    this.monitoringInterval = null;
    this.isMonitoring = false;
    console.log('Security monitoring stopped');
  }

  private async checkSecurity(): Promise<Omit<SecurityEvent, 'timestamp'>[]> {
    const [appEvents, networkEvents] = await Promise.all([
      this.checkAppBehavior(),
      this.checkNetworkActivity()
    ]);

    return [...appEvents, ...networkEvents];
  }

  private async checkAppBehavior(): Promise<Omit<SecurityEvent, 'timestamp'>[]> {
    const events: Omit<SecurityEvent, 'timestamp'>[] = [];
    
    try {
      if (process.platform === 'win32') {
        // Windows implementation using wmic
        const { stdout } = await execAsync('wmic process get ProcessId,Name,WorkingSetSize /format:csv');
        const lines = stdout.split('\n').filter(line => line.trim());
        const header = lines[0].split(',');
        const processData = lines.slice(1)
          .map(line => line.split(','))
          .filter(parts => parts.length === header.length)
          .map(parts => ({
            pid: parts[1],
            name: parts[2],
            memory: parseInt(parts[3] || '0')
          } as ProcessInfo));

        // Find high memory usage processes
        const highMemoryThreshold = os.totalmem() * 0.1; // 10% of total memory
        const highMemoryProcesses = processData.filter(p => p.memory > highMemoryThreshold);

        if (highMemoryProcesses.length > 0) {
          events.push({
            type: 'app_scan',
            severity: 'medium',
            details: {
              message: 'High memory usage detected',
              processes: highMemoryProcesses.map(p => ({
                name: p.name,
                memory: Math.round(p.memory / 1024 / 1024) + 'MB'
              }))
            }
          });
        }

        // Check for suspicious processes using threat scanner
        for (const process of processData) {
          const scanResult = await this.threatScanner.scanProcess(process.name);
          if (scanResult.isThreat) {
            events.push({
              type: 'app_scan',
              severity: scanResult.confidence > 0.7 ? 'high' : 'medium',
              details: {
                message: 'Suspicious process detected',
                process: process.name,
                details: scanResult.details
              }
            });
          }
        }
      } else {
        // Unix implementation
        const { stdout } = await execAsync('ps -A -o %cpu,comm');
        const highCpuProcesses = stdout
          .split('\n')
          .slice(1)
          .map(line => {
            const [cpu, ...comm] = line.trim().split(' ');
            return {
              name: comm.join(' '),  // Use as name instead of process
              cpu: parseFloat(cpu),
              memory: 'N/A'  // Memory info not available in this command
            };
          })
          .filter(({ cpu }) => cpu > 80);

        if (highCpuProcesses.length > 0) {
          events.push({
            type: 'app_scan',
            severity: 'medium',
            details: {
              message: 'High CPU usage detected',
              processes: highCpuProcesses
            }
          });
        }
      }
    } catch (error: any) {
      console.error('Error checking app behavior:', error);
      events.push({
        type: 'system_alert',
        severity: 'medium',
        details: {
          message: 'Failed to check app behavior',
          error: error?.message || 'Unknown error'
        }
      });
    }
    
    return events;
  }

  private async checkNetworkActivity(): Promise<Omit<SecurityEvent, 'timestamp'>[]> {
    const events: Omit<SecurityEvent, 'timestamp'>[] = [];
    
    try {
      // Get network interfaces
      const interfaces = networkInterfaces();
      const activeInterfaces = Object.entries(interfaces)
        .filter(([name, info]) => {
          if (!info) return false;
          return info.some(addr => !addr.internal && addr.family === 'IPv4');
        });

      // Check for suspicious network activity
      for (const [name, info] of activeInterfaces) {
        if (!info) continue;
        
        const ipv4 = info.find(addr => addr.family === 'IPv4');
        if (!ipv4) continue;

        try {
          if (process.platform === 'win32') {
            // Windows implementation using netstat
            const { stdout } = await execAsync('netstat -n');
            const connections = stdout.split('\n')
              .slice(4) // Skip header lines
              .filter(line => line.trim())
              .map(line => {
                const parts = line.trim().split(/\s+/);
                return {
                  localAddress: parts[1],
                  remoteAddress: parts[2],
                  state: parts[3]
                } as NetworkConnection;
              });
            
            // Check each connection for suspicious activity
            for (const connection of connections) {
              const scanResult = await this.threatScanner.scanNetwork(connection);
              if (scanResult.isSuspicious) {
                events.push({
                  type: 'network_activity',
                  severity: scanResult.risk,
                  details: {
                    message: 'Suspicious network activity detected',
                    connection,
                    details: scanResult.details
                  }
                });
              }
            }

            // Check for high number of connections
            if (connections.length > 100) {
              events.push({
                type: 'network_activity',
                severity: 'medium',
                details: {
                  message: 'High number of network connections detected',
                  interface: name,
                  connections: connections.length,
                  ipAddress: ipv4.address
                }
              });
            }
          } else {
            // Unix implementation
            const { stdout } = await execAsync('netstat -n');
            const connections = stdout.split('\n').length - 2;
            
            if (connections > 100) {
              events.push({
                type: 'network_activity',
                severity: 'medium',
                details: {
                  message: 'High number of network connections detected',
                  interface: name,
                  connections,
                  ipAddress: ipv4.address
                }
              });
            }
          }
        } catch (error: any) {
          console.error('Error checking network activity:', error);
          events.push({
            type: 'system_alert',
            severity: 'medium',
            details: {
              message: 'Failed to check network activity',
              error: error?.message || 'Unknown error'
            }
          });
        }
      }
    } catch (error: any) {
      console.error('Error checking network interfaces:', error);
      events.push({
        type: 'system_alert',
        severity: 'medium',
        details: {
          message: 'Failed to check network interfaces',
          error: error?.message || 'Unknown error'
        }
      });
    }
    
    return events;
  }

  public getMonitoringStatus() {
    return {
      isActive: this.isMonitoring,
      lastCheck: new Date(),
      activeMonitors: {
        appBehavior: true,
        networkActivity: true,
        permissionChanges: true
      }
    };
  }

  public getSecurityEvents() {
    return this.securityEvents;
  }
}

export default SecurityMonitorService; 