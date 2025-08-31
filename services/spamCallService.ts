import axios from 'axios';
import { SECURITY_CONFIG } from '../config/env';

interface NumVerifyResponse {
  valid: boolean;
  number: string;
  local_format: string;
  international_format: string;
  country_prefix: string;
  country_code: string;
  country_name: string;
  location: string;
  carrier: string;
  line_type: string;
}

interface SpamCheckResult {
  isSpam: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  reason: string;
  phoneInfo: NumVerifyResponse | null;
}

class SpamCallService {
  private spamPatterns = [
    'telemarketing',
    'robocall',
    'scam',
    'fraud',
    'unknown',
    'private'
  ];

  private suspiciousCarriers = [
    'voip',
    'virtual',
    'prepaid'
  ];

  async checkPhoneNumber(phoneNumber: string): Promise<SpamCheckResult> {
    try {
      console.log('Checking phone number:', phoneNumber);
      const cleanNumber = this.cleanPhoneNumber(phoneNumber);
      console.log('Clean number:', cleanNumber);
      
      const phoneInfo = await this.getPhoneInfo(cleanNumber);
      console.log('Phone info received:', phoneInfo);
      
      if (!phoneInfo) {
        return {
          isSpam: true,
          riskLevel: 'high',
          reason: 'Invalid or unverifiable number',
          phoneInfo: null
        };
      }

      const spamCheck = this.analyzeSpamRisk(phoneInfo);
      return {
        ...spamCheck,
        phoneInfo
      };
    } catch (error) {
      console.error('Spam check failed:', error);
      return {
        isSpam: false,
        riskLevel: 'low',
        reason: 'Unable to verify number - API error',
        phoneInfo: null
      };
    }
  }

  private async getPhoneInfo(phoneNumber: string): Promise<NumVerifyResponse | null> {
    try {
      console.log('Making API request to:', `${SECURITY_CONFIG.numVerify.baseUrl}/validate`);
      console.log('API Key:', SECURITY_CONFIG.numVerify.apiKey ? 'Present' : 'Missing');
      
      const response = await axios.get(`${SECURITY_CONFIG.numVerify.baseUrl}/validate`, {
        params: {
          access_key: SECURITY_CONFIG.numVerify.apiKey,
          number: phoneNumber,
          format: 1
        },
        timeout: 10000
      });

      console.log('API Response:', response.data);
      return response.data.valid ? response.data : null;
    } catch (error: any) {
      console.error('NumVerify API error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      return null;
    }
  }

  private analyzeSpamRisk(phoneInfo: NumVerifyResponse): Omit<SpamCheckResult, 'phoneInfo'> {
    let riskScore = 0;
    const reasons: string[] = [];

    // Check line type - mobile numbers are generally safer
    if (phoneInfo.line_type === 'mobile') {
      riskScore += 0; // Mobile numbers are normal
    } else if (phoneInfo.line_type === 'landline') {
      riskScore += 0; // Landlines are also normal
    } else if (phoneInfo.line_type === 'voip') {
      riskScore += 2; // VoIP can be suspicious
      reasons.push('VoIP number');
    } else {
      riskScore += 1;
      reasons.push('Unknown line type');
    }

    // Check carrier for suspicious patterns
    if (this.suspiciousCarriers.some(carrier => 
      phoneInfo.carrier?.toLowerCase().includes(carrier))) {
      riskScore += 2;
      reasons.push('Suspicious carrier');
    }

    // Only mark as spam if there are actual suspicious indicators
    // Remove blanket country-based discrimination
    
    // Determine risk level based on actual suspicious behavior
    let riskLevel: 'low' | 'medium' | 'high';
    let isSpam = false;

    if (riskScore >= 4) {
      riskLevel = 'high';
      isSpam = true;
    } else if (riskScore >= 2) {
      riskLevel = 'medium';
      isSpam = false; // Medium risk doesn't mean spam
    } else {
      riskLevel = 'low';
    }

    return {
      isSpam,
      riskLevel,
      reason: reasons.length > 0 ? reasons.join(', ') : 'Number appears legitimate'
    };
  }

  // Removed discriminatory country-based spam detection
  // Real spam detection should be based on behavior, not geography

  private cleanPhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/[^\d+]/g, '');
  }

  // Block/Allow list management
  private blockedNumbers = new Set<string>();
  private allowedNumbers = new Set<string>();

  blockNumber(phoneNumber: string): void {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    this.blockedNumbers.add(cleanNumber);
    this.allowedNumbers.delete(cleanNumber);
  }

  allowNumber(phoneNumber: string): void {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    this.allowedNumbers.add(cleanNumber);
    this.blockedNumbers.delete(cleanNumber);
  }

  isBlocked(phoneNumber: string): boolean {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    return this.blockedNumbers.has(cleanNumber);
  }

  isAllowed(phoneNumber: string): boolean {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    return this.allowedNumbers.has(cleanNumber);
  }
}

export default new SpamCallService();