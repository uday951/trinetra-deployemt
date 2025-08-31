const axios = require('axios');

class RealTimeScanner {
  constructor() {
    this.virusTotalApiKey = process.env.VIRUSTOTAL_API_KEY;
    this.googleSafeBrowsingApiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    this.lastVirusTotalCall = 0;
    this.scanQueue = [];
    this.isProcessing = false;
  }

  // VirusTotal file hash scanning
  async scanFileHash(fileHash) {
    try {
      await this.checkRateLimit();
      
      const response = await axios.get(
        `https://www.virustotal.com/vtapi/v2/file/report`,
        {
          params: {
            apikey: this.virusTotalApiKey,
            resource: fileHash
          }
        }
      );

      const data = response.data;
      
      if (data.response_code === 1) {
        const positives = data.positives || 0;
        const total = data.total || 0;
        
        return {
          isMalicious: positives > 0,
          threatLevel: this.getThreatLevel(positives, total),
          detectionRatio: `${positives}/${total}`,
          scanDate: data.scan_date,
          threats: this.extractThreats(data.scans || {}),
          engines: Object.keys(data.scans || {})
        };
      }

      return {
        isMalicious: false,
        threatLevel: 'clean',
        detectionRatio: '0/0',
        scanDate: new Date().toISOString(),
        threats: [],
        engines: []
      };
    } catch (error) {
      console.error('VirusTotal scan error:', error.message);
      throw new Error('Failed to scan file hash');
    }
  }

  // Google Safe Browsing URL check
  async checkURL(url) {
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

      const response = await axios.post(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${this.googleSafeBrowsingApiKey}`,
        requestBody
      );

      const data = response.data;
      
      if (data.matches && data.matches.length > 0) {
        const match = data.matches[0];
        return {
          isSafe: false,
          threatTypes: [match.threatType],
          platform: [match.platformType],
          details: `Threat detected: ${match.threatType}`,
          threatLevel: 'malicious'
        };
      }

      return {
        isSafe: true,
        threatTypes: [],
        platform: [],
        details: 'URL is safe',
        threatLevel: 'clean'
      };
    } catch (error) {
      console.error('Google Safe Browsing error:', error.message);
      throw new Error('Failed to check URL safety');
    }
  }

  // Real-time app scanning
  async scanApp(appData) {
    try {
      const { packageName, hash, permissions = [] } = appData;
      
      // Scan file hash if available
      let virusTotalResult = null;
      if (hash) {
        virusTotalResult = await this.scanFileHash(hash);
      }

      // Check package domain reputation
      const domain = this.extractDomainFromPackage(packageName);
      const urlResult = await this.checkURL(`https://${domain}`);

      // Analyze permissions for suspicious behavior
      const permissionAnalysis = this.analyzePermissions(permissions);

      // Combine results
      const combinedThreatLevel = this.combineThreatLevels([
        virusTotalResult?.threatLevel || 'clean',
        urlResult.threatLevel,
        permissionAnalysis.threatLevel
      ]);

      return {
        packageName,
        isMalicious: combinedThreatLevel !== 'clean',
        threatLevel: combinedThreatLevel,
        virusTotalResult,
        urlResult,
        permissionAnalysis,
        scanDate: new Date().toISOString(),
        recommendations: this.generateRecommendations(combinedThreatLevel, permissionAnalysis)
      };
    } catch (error) {
      console.error(`Failed to scan app ${appData.packageName}:`, error.message);
      return {
        packageName: appData.packageName,
        isMalicious: false,
        threatLevel: 'error',
        error: error.message,
        scanDate: new Date().toISOString(),
        recommendations: ['Unable to scan app - try again later']
      };
    }
  }

  // Bulk scan multiple apps with queue management
  async bulkScanApps(apps) {
    const results = [];
    
    for (let i = 0; i < apps.length; i++) {
      try {
        console.log(`Scanning app ${i + 1}/${apps.length}: ${apps[i].packageName}`);
        
        const result = await this.scanApp(apps[i]);
        results.push(result);
        
        // Rate limiting - wait 15 seconds between scans for free tier
        if (i < apps.length - 1) {
          console.log('Waiting 15 seconds for rate limit...');
          await this.delay(15000);
        }
      } catch (error) {
        console.error(`Failed to scan ${apps[i].packageName}:`, error.message);
        results.push({
          packageName: apps[i].packageName,
          isMalicious: false,
          threatLevel: 'error',
          error: error.message,
          scanDate: new Date().toISOString()
        });
      }
    }
    
    return results;
  }

  // Get device security score
  async getDeviceSecurityScore(installedApps) {
    try {
      // Sample first 10 apps for quick assessment
      const sampleApps = installedApps.slice(0, 10);
      const scanResults = await this.bulkScanApps(sampleApps);
      
      let threats = 0;
      let suspicious = 0;
      let clean = 0;
      
      scanResults.forEach(result => {
        if (result.threatLevel === 'malicious') threats++;
        else if (result.threatLevel === 'suspicious') suspicious++;
        else if (result.threatLevel === 'clean') clean++;
      });
      
      // Calculate score (0-100)
      const totalScanned = threats + suspicious + clean;
      const score = totalScanned > 0 ? 
        Math.round(((clean + (suspicious * 0.5)) / totalScanned) * 100) : 100;
      
      const recommendations = [];
      if (threats > 0) {
        recommendations.push(`Remove ${threats} malicious app(s)`);
        recommendations.push('Run full device scan immediately');
      }
      if (suspicious > 0) {
        recommendations.push(`Review ${suspicious} suspicious app(s)`);
      }
      if (score < 70) {
        recommendations.push('Enable real-time protection');
        recommendations.push('Update all apps to latest versions');
      }
      
      return {
        score,
        threats,
        suspicious,
        clean,
        totalScanned,
        recommendations,
        lastScan: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to calculate security score:', error.message);
      return {
        score: 0,
        threats: 0,
        suspicious: 0,
        clean: 0,
        totalScanned: 0,
        recommendations: ['Unable to calculate security score'],
        error: error.message,
        lastScan: new Date().toISOString()
      };
    }
  }

  // Helper methods
  async checkRateLimit() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastVirusTotalCall;
    
    if (timeSinceLastCall < 15000) { // 15 seconds minimum
      await this.delay(15000 - timeSinceLastCall);
    }
    
    this.lastVirusTotalCall = Date.now();
  }

  getThreatLevel(positives, total) {
    if (positives === 0) return 'clean';
    if (positives >= 5) return 'malicious';
    return 'suspicious';
  }

  extractThreats(scans) {
    const threats = [];
    for (const [engine, result] of Object.entries(scans)) {
      if (result && result.detected) {
        threats.push(result.result || 'Unknown threat');
      }
    }
    return [...new Set(threats)];
  }

  extractDomainFromPackage(packageName) {
    const parts = packageName.split('.');
    return parts.length >= 2 ? `${parts[parts.length - 1]}.${parts[parts.length - 2]}` : packageName;
  }

  analyzePermissions(permissions) {
    const dangerousPermissions = [
      'android.permission.READ_SMS',
      'android.permission.SEND_SMS',
      'android.permission.READ_CONTACTS',
      'android.permission.RECORD_AUDIO',
      'android.permission.CAMERA',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.READ_CALL_LOG',
      'android.permission.SYSTEM_ALERT_WINDOW'
    ];

    const foundDangerous = permissions.filter(p => dangerousPermissions.includes(p));
    
    let threatLevel = 'clean';
    if (foundDangerous.length >= 4) threatLevel = 'malicious';
    else if (foundDangerous.length >= 2) threatLevel = 'suspicious';

    return {
      threatLevel,
      dangerousPermissions: foundDangerous,
      riskScore: foundDangerous.length * 10,
      details: foundDangerous.length > 0 ? 
        `App requests ${foundDangerous.length} dangerous permissions` : 
        'App permissions appear safe'
    };
  }

  combineThreatLevels(levels) {
    if (levels.includes('malicious')) return 'malicious';
    if (levels.includes('suspicious')) return 'suspicious';
    return 'clean';
  }

  generateRecommendations(threatLevel, permissionAnalysis) {
    const recommendations = [];
    
    if (threatLevel === 'malicious') {
      recommendations.push('URGENT: Uninstall this app immediately');
      recommendations.push('Run full device scan');
      recommendations.push('Change passwords for sensitive accounts');
    } else if (threatLevel === 'suspicious') {
      recommendations.push('Review app carefully before using');
      recommendations.push('Monitor app behavior');
      recommendations.push('Consider finding alternative app');
    }
    
    if (permissionAnalysis.dangerousPermissions.length > 0) {
      recommendations.push('Review and restrict app permissions');
    }
    
    return recommendations;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new RealTimeScanner();