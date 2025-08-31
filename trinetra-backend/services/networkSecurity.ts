import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const ABUSEIPDB_API_KEY = process.env.ABUSEIPDB_API_KEY;
const ABUSEIPDB_API_URL = 'https://api.abuseipdb.com/api/v2';

interface IPCheckResult {
  ipAddress: string;
  isPublic: boolean;
  ipVersion: number;
  isWhitelisted: boolean;
  abuseConfidenceScore: number;
  countryCode: string;
  totalReports: number;
  lastReportedAt: string | null;
}

class NetworkSecurityService {
  private static instance: NetworkSecurityService;
  private cachedResults: Map<string, { result: IPCheckResult; timestamp: number }> = new Map();
  private CACHE_DURATION = 3600000; // 1 hour in milliseconds

  private constructor() {}

  public static getInstance(): NetworkSecurityService {
    if (!NetworkSecurityService.instance) {
      NetworkSecurityService.instance = new NetworkSecurityService();
    }
    return NetworkSecurityService.instance;
  }

  public async checkIP(ip: string): Promise<IPCheckResult | null> {
    try {
      // Check cache first
      const cached = this.cachedResults.get(ip);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.result;
      }

      const response = await axios.get(`${ABUSEIPDB_API_URL}/check`, {
        params: {
          ipAddress: ip,
          maxAgeInDays: 90,
        },
        headers: {
          'Key': ABUSEIPDB_API_KEY,
          'Accept': 'application/json',
        },
      });

      const result = response.data.data;
      
      // Cache the result
      this.cachedResults.set(ip, {
        result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      console.error('Error checking IP:', error);
      return null;
    }
  }

  public async checkMultipleIPs(ips: string[]): Promise<Map<string, IPCheckResult | null>> {
    const results = new Map<string, IPCheckResult | null>();
    
    // Use Promise.all to check IPs in parallel, but limit to 5 concurrent requests
    const batchSize = 5;
    for (let i = 0; i < ips.length; i += batchSize) {
      const batch = ips.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(ip => this.checkIP(ip))
      );
      
      batch.forEach((ip, index) => {
        results.set(ip, batchResults[index]);
      });
    }

    return results;
  }

  public assessNetworkThreat(checkResult: IPCheckResult | null): {
    threatLevel: 'low' | 'medium' | 'high';
    reason?: string;
  } {
    if (!checkResult) {
      return { threatLevel: 'medium', reason: 'Unable to verify IP address' };
    }

    const { abuseConfidenceScore, totalReports } = checkResult;

    if (abuseConfidenceScore >= 80) {
      return {
        threatLevel: 'high',
        reason: `High abuse confidence score (${abuseConfidenceScore}%) with ${totalReports} reports`
      };
    } else if (abuseConfidenceScore >= 40) {
      return {
        threatLevel: 'medium',
        reason: `Moderate abuse confidence score (${abuseConfidenceScore}%) with ${totalReports} reports`
      };
    }

    return {
      threatLevel: 'low',
      reason: totalReports > 0 ? `Low risk IP with ${totalReports} historical reports` : 'No abuse reports found'
    };
  }
}

export default NetworkSecurityService; 