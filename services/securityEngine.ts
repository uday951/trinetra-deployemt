import { SECURITY_CONFIG } from '../config/env';
import { http } from './api';

export interface ThreatReport {
  isMalicious: boolean;
  threatLevel: 'clean' | 'suspicious' | 'malicious';
  detectionRatio: string;
  engines: string[];
  scanDate: string;
  threats: string[];
}

export interface URLThreatReport {
  isSafe: boolean;
  threatTypes: string[];
  platform: string[];
  details: string;
}

class SecurityEngine {
  private static instance: SecurityEngine;
  private virusTotalRateLimit = 0;
  private lastVirusTotalCall = 0;

  private constructor() {}

  public static getInstance(): SecurityEngine {
    if (!SecurityEngine.instance) {
      SecurityEngine.instance = new SecurityEngine();
    }
    return SecurityEngine.instance;
  }

  // VirusTotal File Hash Scanning
  async scanFileHash(fileHash: string): Promise<ThreatReport> {
    try {
      await this.checkVirusTotalRateLimit();
      
      const response = await fetch(
        `${SECURITY_CONFIG.virusTotal.baseUrl}/file/report?apikey=${SECURITY_CONFIG.virusTotal.apiKey}&resource=${fileHash}`,
        { method: 'GET' }
      );

      const data = await response.json();
      
      if (data.response_code === 1) {
        const positives = data.positives || 0;
        const total = data.total || 0;
        const detectionRatio = `${positives}/${total}`;
        
        let threatLevel: 'clean' | 'suspicious' | 'malicious' = 'clean';
        if (positives > 5) threatLevel = 'malicious';
        else if (positives > 0) threatLevel = 'suspicious';

        return {
          isMalicious: positives > 0,
          threatLevel,
          detectionRatio,
          engines: Object.keys(data.scans || {}),
          scanDate: data.scan_date,
          threats: this.extractThreats(data.scans || {})
        };
      }

      return {
        isMalicious: false,
        threatLevel: 'clean',
        detectionRatio: '0/0',
        engines: [],
        scanDate: new Date().toISOString(),
        threats: []
      };
    } catch (error) {
      console.error('VirusTotal scan error:', error);
      throw new Error('Failed to scan file hash');
    }
  }

  // Google Safe Browsing URL Check
  async checkURL(url: string): Promise<URLThreatReport> {
    try {
      const requestBody = {
        client: {
          clientId: 'trinetra-security',
          clientVersion: '1.0.0'
        },
        threatInfo: {
          threatTypes: [
            'MALWARE',
            'SOCIAL_ENGINEERING',
            'UNWANTED_SOFTWARE',
            'POTENTIALLY_HARMFUL_APPLICATION'
          ],
          platformTypes: ['ANDROID', 'ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }]
        }
      };

      const response = await fetch(
        `${SECURITY_CONFIG.googleSafeBrowsing.baseUrl}/threatMatches:find?key=${SECURITY_CONFIG.googleSafeBrowsing.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      const data = await response.json();
      
      if (data.matches && data.matches.length > 0) {
        const match = data.matches[0];
        return {
          isSafe: false,
          threatTypes: [match.threatType],
          platform: [match.platformType],
          details: `Threat detected: ${match.threatType}`
        };
      }

      return {
        isSafe: true,
        threatTypes: [],
        platform: [],
        details: 'URL is safe'
      };
    } catch (error) {
      console.error('Google Safe Browsing error:', error);
      throw new Error('Failed to check URL safety');
    }
  }

  // Scan App Package for threats
  async scanAppPackage(packageName: string, appHash?: string): Promise<ThreatReport> {
    try {
      // First check if we have a hash to scan
      if (appHash) {
        return await this.scanFileHash(appHash);
      }

      // Fallback: Check package name reputation
      const urlCheck = await this.checkURL(`https://${packageName.replace(/\./g, '/')}`);
      
      return {
        isMalicious: !urlCheck.isSafe,
        threatLevel: !urlCheck.isSafe ? 'suspicious' : 'clean',
        detectionRatio: !urlCheck.isSafe ? '1/1' : '0/1',
        engines: ['Google Safe Browsing'],
        scanDate: new Date().toISOString(),
        threats: urlCheck.threatTypes
      };
    } catch (error) {
      console.error('App package scan error:', error);
      throw new Error('Failed to scan app package');
    }
  }

  // Real-time threat scanning for multiple apps
  async bulkScanApps(apps: Array<{packageName: string, hash?: string}>): Promise<Map<string, ThreatReport>> {
    const results = new Map<string, ThreatReport>();
    
    for (const app of apps) {
      try {
        const report = await this.scanAppPackage(app.packageName, app.hash);
        results.set(app.packageName, report);
        
        // Add delay to respect rate limits
        await this.delay(15000); // 15 seconds between requests for free tier
      } catch (error) {
        console.error(`Failed to scan ${app.packageName}:`, error);
        results.set(app.packageName, {
          isMalicious: false,
          threatLevel: 'clean',
          detectionRatio: 'error',
          engines: [],
          scanDate: new Date().toISOString(),
          threats: ['Scan failed']
        });
      }
    }
    
    return results;
  }

  // Check if URL is malicious
  async isURLMalicious(url: string): Promise<boolean> {
    try {
      const report = await this.checkURL(url);
      return !report.isSafe;
    } catch (error) {
      console.error('URL check error:', error);
      return false; // Default to safe if check fails
    }
  }

  // Get security score for device
  async getDeviceSecurityScore(installedApps: string[]): Promise<{
    score: number;
    threats: number;
    scannedApps: number;
    recommendations: string[];
  }> {
    let threats = 0;
    let scannedApps = 0;
    const recommendations: string[] = [];

    // Sample a few apps for quick assessment (to respect rate limits)
    const sampleApps = installedApps.slice(0, 5);
    
    for (const packageName of sampleApps) {
      try {
        const report = await this.scanAppPackage(packageName);
        scannedApps++;
        
        if (report.isMalicious) {
          threats++;
          recommendations.push(`Remove suspicious app: ${packageName}`);
        }
        
        await this.delay(15000); // Rate limit delay
      } catch (error) {
        console.error(`Failed to scan ${packageName}:`, error);
      }
    }

    const score = Math.max(0, 100 - (threats * 20));
    
    if (score < 80) {
      recommendations.push('Run full device scan');
      recommendations.push('Update all apps to latest versions');
    }
    
    if (score < 60) {
      recommendations.push('Consider factory reset');
      recommendations.push('Enable real-time protection');
    }

    return {
      score,
      threats,
      scannedApps,
      recommendations
    };
  }

  // Private helper methods
  private async checkVirusTotalRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastVirusTotalCall;
    
    if (timeSinceLastCall < 15000) { // 15 seconds minimum between calls
      await this.delay(15000 - timeSinceLastCall);
    }
    
    this.lastVirusTotalCall = Date.now();
  }

  private extractThreats(scans: any): string[] {
    const threats: string[] = [];
    for (const [engine, result] of Object.entries(scans)) {
      if (result && typeof result === 'object' && (result as any).detected) {
        threats.push((result as any).result || 'Unknown threat');
      }
    }
    return [...new Set(threats)]; // Remove duplicates
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const securityEngine = SecurityEngine.getInstance();