import axios from 'axios';

export interface VpnStatus {
  isEnabled: boolean;
  currentServer: string;
  blockedDomains: string[];
  lastUpdated: string;
}

export class VpnService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private currentStatus: VpnStatus;
  private isDevelopment: boolean;

  constructor() {
    this.apiKey = process.env.VPN_API_KEY || 'ASUizWwPMJojIfbfjtnFqG_ASfZtAaMJzPBQMSUhrFkbltEZYsdgwj_e8feea6f694ce64308a50718b1a331e70b422325';
    this.apiUrl = process.env.VPN_API_URL || 'https://api.vpn-provider.com';
    this.isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    console.log('VPN Service initialized in', this.isDevelopment ? 'development' : 'production', 'mode');
    this.currentStatus = {
      isEnabled: false,
      currentServer: 'Not Connected',
      blockedDomains: [],
      lastUpdated: new Date().toISOString()
    };
  }

  async connect(): Promise<VpnStatus> {
    try {
      console.log('Attempting to connect to VPN...');
      
      if (this.isDevelopment) {
        // Mock successful connection in development
        console.log('Development mode: Mocking VPN connection');
        this.currentStatus = {
          ...this.currentStatus,
          isEnabled: true,
          currentServer: 'Development Server',
          lastUpdated: new Date().toISOString()
        };
        console.log('Development mode: Returning mock connected status:', this.currentStatus);
        return this.currentStatus;
      }

      // Production mode code...
      throw new Error('Production VPN not implemented');
    } catch (error: any) {
      console.error('Error connecting to VPN:', error.message);
      if (this.isDevelopment) {
        // In development, return mock connected status on error
        console.log('Development mode: Returning mock connected status after error');
        this.currentStatus = {
          ...this.currentStatus,
          isEnabled: true,
          currentServer: 'Development Server',
          lastUpdated: new Date().toISOString()
        };
        return this.currentStatus;
      }
      throw new Error(error.response?.data?.message || 'Failed to connect to VPN');
    }
  }

  async disconnect(): Promise<VpnStatus> {
    try {
      console.log('Attempting to disconnect from VPN...');
      
      if (this.isDevelopment) {
        // Mock successful disconnection in development
        console.log('Development mode: Mocking VPN disconnection');
        this.currentStatus = {
          ...this.currentStatus,
          isEnabled: false,
          currentServer: 'Not Connected',
          lastUpdated: new Date().toISOString()
        };
        console.log('Development mode: Returning mock disconnected status:', this.currentStatus);
        return this.currentStatus;
      }

      // Production mode code...
      throw new Error('Production VPN not implemented');
    } catch (error: any) {
      console.error('Error disconnecting from VPN:', error.message);
      if (this.isDevelopment) {
        // In development, return mock disconnected status on error
        console.log('Development mode: Returning mock disconnected status after error');
        this.currentStatus = {
          ...this.currentStatus,
          isEnabled: false,
          currentServer: 'Not Connected',
          lastUpdated: new Date().toISOString()
        };
        return this.currentStatus;
      }
      throw new Error(error.response?.data?.message || 'Failed to disconnect from VPN');
    }
  }

  async getStatus(): Promise<VpnStatus> {
    try {
      console.log('Fetching VPN status...');
      
      if (this.isDevelopment) {
        // Return mock status in development
        console.log('Development mode: Returning mock VPN status:', this.currentStatus);
        return this.currentStatus;
      }

      // Production mode code...
      throw new Error('Production VPN not implemented');
    } catch (error: any) {
      console.error('Error getting VPN status:', error.message);
      // Return current status if API call fails
      console.log('Returning current status after error:', this.currentStatus);
      return this.currentStatus;
    }
  }

  async blockDomain(domain: string): Promise<VpnStatus> {
    try {
      console.log('Attempting to block domain:', domain);
      
      if (this.isDevelopment) {
        // Mock domain blocking in development
        console.log('Development mode: Mocking domain block');
        if (!this.currentStatus.blockedDomains.includes(domain)) {
          this.currentStatus.blockedDomains.push(domain);
          this.currentStatus.lastUpdated = new Date().toISOString();
        }
        console.log('Development mode: Returning updated status:', this.currentStatus);
        return this.currentStatus;
      }

      // Production mode code...
      throw new Error('Production VPN not implemented');
    } catch (error: any) {
      console.error('Error blocking domain:', error.message);
      if (this.isDevelopment) {
        console.log('Development mode: Returning current status after error:', this.currentStatus);
        return this.currentStatus;
      }
      throw new Error(error.response?.data?.message || 'Failed to block domain');
    }
  }

  async unblockDomain(domain: string): Promise<VpnStatus> {
    try {
      console.log('Attempting to unblock domain:', domain);
      
      if (this.isDevelopment) {
        // Mock domain unblocking in development
        console.log('Development mode: Mocking domain unblock');
        this.currentStatus.blockedDomains = this.currentStatus.blockedDomains.filter(d => d !== domain);
        this.currentStatus.lastUpdated = new Date().toISOString();
        console.log('Development mode: Returning updated status:', this.currentStatus);
        return this.currentStatus;
      }

      // Production mode code...
      throw new Error('Production VPN not implemented');
    } catch (error: any) {
      console.error('Error unblocking domain:', error.message);
      if (this.isDevelopment) {
        console.log('Development mode: Returning current status after error:', this.currentStatus);
        return this.currentStatus;
      }
      throw new Error(error.response?.data?.message || 'Failed to unblock domain');
    }
  }

  async getBlockedDomains(): Promise<string[]> {
    try {
      console.log('Fetching blocked domains...');
      
      if (this.isDevelopment) {
        // Return mock blocked domains in development
        console.log('Development mode: Returning mock blocked domains:', this.currentStatus.blockedDomains);
        return this.currentStatus.blockedDomains;
      }

      // Production mode code...
      throw new Error('Production VPN not implemented');
    } catch (error: any) {
      console.error('Error getting blocked domains:', error.message);
      // Return current blocked domains if API call fails
      console.log('Returning current blocked domains after error:', this.currentStatus.blockedDomains);
      return this.currentStatus.blockedDomains;
    }
  }
} 