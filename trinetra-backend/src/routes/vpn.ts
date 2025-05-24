import { Router } from 'express';
import { VpnService } from '../services/vpn';

const router = Router();
const vpnService = new VpnService();
const isDevelopment = process.env.NODE_ENV === 'development';

// Get VPN status
router.get('/status', async (req, res) => {
  try {
    console.log('GET /vpn/status - Request received');
    const status = await vpnService.getStatus();
    console.log('GET /vpn/status - Response:', status);
    res.json(status);
  } catch (error: any) {
    console.error('GET /vpn/status - Error:', error.message);
    // In development, return mock status on error
    if (isDevelopment) {
      console.log('Development mode: Returning mock status after error');
      const mockStatus = {
        isEnabled: false,
        currentServer: 'Not Connected',
        blockedDomains: [],
        lastUpdated: new Date().toISOString()
      };
      return res.json(mockStatus);
    }
    res.status(500).json({ 
      error: 'Failed to get VPN status',
      details: error.message
    });
  }
});

// Connect to VPN
router.post('/connect', async (req, res) => {
  try {
    console.log('POST /vpn/connect - Request received');
    const status = await vpnService.connect();
    console.log('POST /vpn/connect - Response:', status);
    res.json(status);
  } catch (error: any) {
    console.error('POST /vpn/connect - Error:', error.message);
    // In development, return mock connected status on error
    if (isDevelopment) {
      console.log('Development mode: Returning mock connected status after error');
      const mockStatus = {
        isEnabled: true,
        currentServer: 'Development Server',
        blockedDomains: [],
        lastUpdated: new Date().toISOString()
      };
      return res.json(mockStatus);
    }
    res.status(500).json({ 
      error: 'Failed to connect to VPN',
      details: error.message
    });
  }
});

// Disconnect from VPN
router.post('/disconnect', async (req, res) => {
  try {
    console.log('POST /vpn/disconnect - Request received');
    const status = await vpnService.disconnect();
    console.log('POST /vpn/disconnect - Response:', status);
    res.json(status);
  } catch (error: any) {
    console.error('POST /vpn/disconnect - Error:', error.message);
    // In development, return mock disconnected status on error
    if (isDevelopment) {
      console.log('Development mode: Returning mock disconnected status after error');
      const mockStatus = {
        isEnabled: false,
        currentServer: 'Not Connected',
        blockedDomains: [],
        lastUpdated: new Date().toISOString()
      };
      return res.json(mockStatus);
    }
    res.status(500).json({ 
      error: 'Failed to disconnect from VPN',
      details: error.message
    });
  }
});

// Block a domain
router.post('/block-domain', async (req, res) => {
  try {
    const { domain } = req.body;
    console.log('POST /vpn/block-domain - Request received:', { domain });
    
    if (!domain) {
      console.error('POST /vpn/block-domain - Error: Domain is required');
      return res.status(400).json({ error: 'Domain is required' });
    }
    
    const status = await vpnService.blockDomain(domain);
    console.log('POST /vpn/block-domain - Response:', status);
    res.json(status);
  } catch (error: any) {
    console.error('POST /vpn/block-domain - Error:', error.message);
    // In development, return current status on error
    if (isDevelopment) {
      console.log('Development mode: Returning current status after error');
      const status = await vpnService.getStatus();
      return res.json(status);
    }
    res.status(500).json({ 
      error: 'Failed to block domain',
      details: error.message
    });
  }
});

// Unblock a domain
router.post('/unblock-domain', async (req, res) => {
  try {
    const { domain } = req.body;
    console.log('POST /vpn/unblock-domain - Request received:', { domain });
    
    if (!domain) {
      console.error('POST /vpn/unblock-domain - Error: Domain is required');
      return res.status(400).json({ error: 'Domain is required' });
    }
    
    const status = await vpnService.unblockDomain(domain);
    console.log('POST /vpn/unblock-domain - Response:', status);
    res.json(status);
  } catch (error: any) {
    console.error('POST /vpn/unblock-domain - Error:', error.message);
    // In development, return current status on error
    if (isDevelopment) {
      console.log('Development mode: Returning current status after error');
      const status = await vpnService.getStatus();
      return res.json(status);
    }
    res.status(500).json({ 
      error: 'Failed to unblock domain',
      details: error.message
    });
  }
});

// Get blocked domains
router.get('/blocked-domains', async (req, res) => {
  try {
    console.log('GET /vpn/blocked-domains - Request received');
    const domains = await vpnService.getBlockedDomains();
    console.log('GET /vpn/blocked-domains - Response:', { domains });
    res.json({ domains });
  } catch (error: any) {
    console.error('GET /vpn/blocked-domains - Error:', error.message);
    // In development, return empty list on error
    if (isDevelopment) {
      console.log('Development mode: Returning empty domains list after error');
      return res.json({ domains: [] });
    }
    res.status(500).json({ 
      error: 'Failed to get blocked domains',
      details: error.message
    });
  }
});

export default router; 