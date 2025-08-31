import { EventEmitter } from 'events';
import ThreatScannerService from './threatScanner';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import { networkInterfaces } from 'os';
import { WebSocket } from 'ws';

const execAsync = promisify(exec);

interface SecurityEvent {
  type: 'app_scan' | 'network_activity' | 'permission_change' | 'system_alert';
  severity: 'low' | 'medium' | 'high';
  details: any;
  timestamp: Date;
}

class SecurityMonitorService extends EventEmitter {
  private static instance: SecurityMonitorService;
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private threatScanner: ThreatScannerService;
  private lastScanResults: Map<string, any> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private readonly MAX_EVENTS = 100;
  private connectedClients: Set<WebSocket> = new Set();

  private constructor() {
    super();
    this.threatScanner = ThreatScannerService.getInstance();
    
    // Set up event listeners for WebSocket notifications
    this.on('security_event', (event: SecurityEvent) => {
      this.notifyClients('security_event', event);
    });

    this.on('high_risk_alert', (event: SecurityEvent) => {
      this.notifyClients('high_risk_alert', event);
    });
  }

  public static getInstance(): SecurityMonitorService {
    if (!SecurityMonitorService.instance) {
      SecurityMonitorService.instance = new SecurityMonitorService();
    }
    return SecurityMonitorService.instance;
  }

  public addClient(ws: WebSocket) {
    this.connectedClients.add(ws);
    
    ws.on('close', () => {
      this.connectedClients.delete(ws);
    });

    // Send initial status
    ws.send(JSON.stringify({
      type: 'monitoring_status',
      data: this.getMonitoringStatus()
    }));
  }

  private notifyClients(eventType: string, data: any) {
    const message = JSON.stringify({ type: eventType, data });
    this.connectedClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public startMonitoring(intervalMs: number = 30000) {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => this.runSecurityCheck(), intervalMs);
    console.log('Security monitoring started');
    
    // Notify clients of status change
    this.notifyClients('monitoring_status', this.getMonitoringStatus());
    
    // Initial check
    this.runSecurityCheck();
  }

  public stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('Security monitoring stopped');
    
    // Notify clients of status change
    this.notifyClients('monitoring_status', this.getMonitoringStatus());
  }

  private async runSecurityCheck() {
    try {
      // Check for new security events
      const events = await this.checkSecurityEvents();
      
      // Add events to history
      events.forEach(event => {
        this.securityEvents.unshift(event);
        // Keep only the last MAX_EVENTS events
        if (this.securityEvents.length > this.MAX_EVENTS) {
          this.securityEvents.pop();
        }
        
        // Emit events
        this.emit('security_event', event);
        if (event.severity === 'high') {
          this.emit('high_risk_alert', event);
        }
      });

    } catch (error) {
      console.error('Error in security check:', error);
      this.emit('error', error);
    }
  }

  private async checkSecurityEvents(): Promise<SecurityEvent[]> {
    const events: SecurityEvent[] = [];
    const timestamp = new Date();

    try {
      // 1. Check for suspicious app behavior
      const appEvents = await this.checkAppBehavior();
      events.push(...appEvents.map(e => ({ ...e, timestamp })));

      // 2. Check for network anomalies
      const networkEvents = await this.checkNetworkActivity();
      events.push(...networkEvents.map(e => ({ ...e, timestamp })));

      // 3. Check for permission changes
      const permissionEvents = await this.checkPermissionChanges();
      events.push(...permissionEvents.map(e => ({ ...e, timestamp })));

    } catch (error) {
      console.error('Error checking security events:', error);
    }

    return events;
  }

  private async checkAppBehavior(): Promise<Omit<SecurityEvent, 'timestamp'>[]> {
    const events: Omit<SecurityEvent, 'timestamp'>[] = [];
    
    try {
      // Check CPU usage
      const { stdout: psOutput } = await execAsync('ps -A -o %cpu,comm');
      const highCpuProcesses = psOutput
        .split('\n')
        .slice(1)
        .map(line => {
          const [cpu, ...comm] = line.trim().split(' ');
          return { cpu: parseFloat(cpu), process: comm.join(' ') };
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
    } catch (error) {
      console.error('Error checking app behavior:', error);
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
          const { stdout: netstatOutput } = await execAsync('netstat -n');
          const connections = netstatOutput.split('\n').length - 2;
          
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
        } catch (error) {
          console.error('Error checking network activity:', error);
        }
      }
    } catch (error) {
      console.error('Error checking network interfaces:', error);
    }
    
    return events;
  }

  private async checkPermissionChanges(): Promise<Omit<SecurityEvent, 'timestamp'>[]> {
    const events: Omit<SecurityEvent, 'timestamp'>[] = [];
    
    try {
      // This is a placeholder for actual permission monitoring
      // In a real implementation, you would track permission changes
      // through the Android API or system logs
    } catch (error) {
      console.error('Error checking permission changes:', error);
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