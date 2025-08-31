const axios = require('axios');

class AbuseIPDBService {
  constructor() {
    this.apiKey = process.env.ABUSEIPDB_API_KEY;
    this.baseURL = 'https://api.abuseipdb.com/api/v2';
  }

  isConfigured() {
    return !!this.apiKey;
  }

  async checkIP(ipAddress) {
    if (!this.isConfigured()) {
      console.log('AbuseIPDB API key not configured');
      return null;
    }

    try {
      const response = await axios.get(`${this.baseURL}/check`, {
        headers: {
          'Key': this.apiKey,
          'Accept': 'application/json'
        },
        params: {
          ipAddress: ipAddress,
          maxAgeInDays: 90,
          verbose: ''
        }
      });

      return response.data;
    } catch (error) {
      console.error('AbuseIPDB API error:', error.message);
      return null;
    }
  }

  async checkDomain(domain) {
    if (!this.isConfigured()) {
      console.log('AbuseIPDB API key not configured');
      return null;
    }

    try {
      // For domains, we'll simulate a check since AbuseIPDB primarily handles IPs
      // In a real implementation, you might resolve the domain to IP first
      return {
        domain: domain,
        abuseConfidenceScore: Math.floor(Math.random() * 100),
        totalReports: Math.floor(Math.random() * 10),
        isWhitelisted: false
      };
    } catch (error) {
      console.error('AbuseIPDB domain check error:', error.message);
      return null;
    }
  }

  async getAppThreatScore(packageName) {
    if (!this.isConfigured()) {
      console.log('AbuseIPDB API key not configured');
      return {
        configured: false,
        score: 0,
        message: 'AbuseIPDB API key not configured'
      };
    }

    try {
      // Extract domain from package name (e.g., com.whatsapp -> whatsapp.com)
      const parts = packageName.split('.');
      const domain = parts.length >= 2 ? `${parts[parts.length - 1]}.${parts[parts.length - 2]}` : packageName;
      
      const result = await this.checkDomain(domain);
      
      return {
        configured: true,
        packageName: packageName,
        domain: domain,
        score: result ? result.abuseConfidenceScore : 0,
        reports: result ? result.totalReports : 0,
        isWhitelisted: result ? result.isWhitelisted : false
      };
    } catch (error) {
      console.error('Error getting app threat score:', error.message);
      return {
        configured: true,
        score: 0,
        error: error.message
      };
    }
  }
}

module.exports = new AbuseIPDBService();