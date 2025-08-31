interface VPNServer {
  id: string;
  name: string;
  country: string;
  city: string;
  flag: string;
  ping: number;
  load: number;
  ip?: string;
  score?: number;
}

interface VPNStatus {
  connected: boolean;
  server?: VPNServer;
  publicIP: string;
  protectedIP?: string;
  connectionTime?: Date;
  bytesTransferred: { up: number; down: number };
}

import { NativeModules, NativeEventEmitter, DeviceEventEmitter } from 'react-native';

const { VPNModule } = NativeModules;

// Debug: Check if VPN module is available
if (!VPNModule) {
  console.error('❌ VPNModule not found in NativeModules');
  console.log('🔍 Available modules:', Object.keys(NativeModules));
} else {
  console.log('✅ VPNModule found:', Object.keys(VPNModule));
}

class VPNService {
  private status: VPNStatus = {
    connected: false,
    publicIP: '',
    bytesTransferred: { up: 0, down: 0 }
  };

  private servers: VPNServer[] = [];
  private fallbackServers: VPNServer[] = [
    { id: 'us-east', name: 'US East', country: 'United States', city: 'New York', flag: '🇺🇸', ping: 45, load: 23 },
    { id: 'uk', name: 'UK London', country: 'United Kingdom', city: 'London', flag: '🇬🇧', ping: 78, load: 18 },
    { id: 'japan', name: 'Japan', country: 'Japan', city: 'Tokyo', flag: '🇯🇵', ping: 120, load: 28 }
  ];

  constructor() {
    // Listen for VPN status changes from native module
    DeviceEventEmitter.addListener('VPNStatusChanged', (event) => {
      this.status.connected = event.connected;
      if (event.serverIP) {
        this.status.protectedIP = event.serverIP;
      }
      if (event.connected) {
        this.status.connectionTime = new Date();
      }
    });
  }

  async loadVPNGateServers(): Promise<VPNServer[]> {
    try {
      const response = await fetch(process.env.EXPO_PUBLIC_VPNGATE_CSV_URL || 'http://www.vpngate.net/api/iphone/');
      const csvData = await response.text();
      
      const lines = csvData.split('\n');
      const servers: VPNServer[] = [];
      
      // Skip header and footer lines
      for (let i = 2; i < lines.length - 2; i++) {
        const fields = lines[i].split(',');
        if (fields.length >= 14) {
          const countryCode = fields[6];
          const country = fields[5];
          const ping = parseInt(fields[3]) || Math.floor(Math.random() * 100) + 20;
          const score = parseInt(fields[2]) || Math.floor(Math.random() * 100000);
          
          servers.push({
            id: `vpngate-${i}`,
            name: `${country} Server`,
            country: country,
            city: fields[4] || 'Unknown',
            flag: this.getCountryFlag(countryCode),
            ping: ping,
            load: Math.floor((100000 - score) / 1000), // Convert score to load percentage
            ip: fields[1],
            score: score
          });
        }
      }
      
      // Return top 10 servers sorted by score
      return servers
        .filter(s => s.country && s.country !== '')
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 10);
    } catch (error) {
      console.log('VPN Gate API failed, using fallback servers');
      return this.fallbackServers;
    }
  }

  private getCountryFlag(countryCode: string): string {
    const flags: { [key: string]: string } = {
      'US': '🇺🇸', 'JP': '🇯🇵', 'KR': '🇰🇷', 'GB': '🇬🇧',
      'DE': '🇩🇪', 'FR': '🇫🇷', 'CA': '🇨🇦', 'AU': '🇦🇺',
      'NL': '🇳🇱', 'SG': '🇸🇬', 'IN': '🇮🇳', 'BR': '🇧🇷',
      'RU': '🇷🇺', 'CN': '🇨🇳', 'TH': '🇹🇭', 'VN': '🇻🇳'
    };
    return flags[countryCode] || '🌍';
  }

  async getPublicIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return '192.168.1.1';
    }
  }

  async getIPLocation(ip: string) {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      return {
        country: data.country_name,
        city: data.city,
        region: data.region,
        flag: data.country_code
      };
    } catch (error) {
      return { country: 'Unknown', city: 'Unknown', region: 'Unknown', flag: '🌍' };
    }
  }

  async connect(serverId: string): Promise<boolean> {
    const server = this.servers.find(s => s.id === serverId);
    if (!server) return false;

    try {
      console.log('🔄 Starting VPN connection process...');
      
      // Check VPN permission first
      const hasPermission = await VPNModule.prepareVPN();
      console.log('🔐 VPN Permission status:', hasPermission);
      
      if (!hasPermission) {
        console.log('📋 Requesting VPN permission...');
        const permissionResult = await VPNModule.requestVPNPermission();
        console.log('📋 Permission result:', permissionResult);
        
        // Wait for user to grant permission
        console.log('⏳ Waiting for user to grant VPN permission...');
        
        // Poll for permission every 2 seconds for up to 30 seconds
        let attempts = 0;
        const maxAttempts = 15;
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const recheckPermission = await VPNModule.prepareVPN();
          
          if (recheckPermission) {
            console.log('✅ VPN permission granted!');
            break;
          }
          
          attempts++;
          console.log(`⏳ Still waiting for permission... (${attempts}/${maxAttempts})`);
        }
        
        // Final check
        const finalCheck = await VPNModule.prepareVPN();
        if (!finalCheck) {
          throw new Error('VPN permission not granted. Please try again and allow VPN access.');
        }
      }

      // Connect to real VPN server
      const serverIP = server.ip || this.generateProtectedIP(server).split('.').slice(0, 3).join('.') + '.1';
      console.log('🌐 Connecting to server:', serverIP);
      
      await VPNModule.connectVPN(serverIP, 1194); // Standard OpenVPN port
      console.log('✅ VPN connection initiated');

      this.status = {
        connected: true,
        server,
        publicIP: await this.getPublicIP(),
        protectedIP: serverIP,
        connectionTime: new Date(),
        bytesTransferred: { up: 0, down: 0 }
      };

      return true;
    } catch (error) {
      console.error('❌ VPN connection failed:', error);
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      await VPNModule.disconnectVPN();
      
      this.status = {
        connected: false,
        publicIP: await this.getPublicIP(),
        bytesTransferred: { up: 0, down: 0 }
      };

      return true;
    } catch (error) {
      console.error('VPN disconnection failed:', error);
      return false;
    }
  }

  async checkVPNStatus(): Promise<boolean> {
    try {
      return await VPNModule.isVPNActive();
    } catch (error) {
      return false;
    }
  }

  getStatus(): VPNStatus {
    return { ...this.status };
  }

  async getServers(): Promise<VPNServer[]> {
    if (this.servers.length === 0) {
      this.servers = await this.loadVPNGateServers();
    }
    return [...this.servers];
  }

  async refreshServers(): Promise<VPNServer[]> {
    this.servers = await this.loadVPNGateServers();
    return [...this.servers];
  }

  private generateProtectedIP(server: VPNServer): string {
    const baseIPs = {
      'us-east': '74.125.224',
      'us-west': '173.194.46',
      'uk': '216.58.213',
      'germany': '172.217.16',
      'japan': '142.250.196',
      'singapore': '172.217.31'
    };
    
    const base = baseIPs[server.id] || '192.168.1';
    const last = Math.floor(Math.random() * 254) + 1;
    return `${base}.${last}`;
  }

  // Simulate data transfer
  updateBytesTransferred() {
    if (this.status.connected) {
      this.status.bytesTransferred.up += Math.random() * 1024 * 10; // 0-10KB
      this.status.bytesTransferred.down += Math.random() * 1024 * 50; // 0-50KB
    }
  }
}

export default new VPNService();