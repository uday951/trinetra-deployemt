import { http } from './api';

export interface RealAppData {
  packageName: string;
  appName: string;
  versionName: string;
  versionCode: number;
  permissions: string[];
  installTime: number;
  lastUpdateTime: number;
  size: number;
  isSystemApp: boolean;
}

export interface ThreatAnalysis {
  packageName: string;
  threatLevel: 'low' | 'medium' | 'high';
  threats: string[];
  recommendations: string[];
  privacyScore: number;
  securityScore: number;
}

export interface AppScanResult {
  success: boolean;
  scannedApps: number;
  results: ThreatAnalysis[];
  scanTime: string;
}

class RealAppScanner {
  private abuseIPDBUrl = 'https://api.abuseipdb.com/api/v2';
  private apiKey = 'c2b9d97e216c55220bd0c5ec5e23ee885f241834562622c7eea9afa2f02a7a18e110b6a4153b996e';

  // Test if APIs are working
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing API connection...');
      
      // Test our backend
      const response = await http.get('/api/test');
      console.log('Backend API:', response.status === 200 ? '✅ Working' : '❌ Failed');
      return response.status === 200;
    } catch (error) {
      console.log('Backend API: ❌ Failed -', error);
      return false;
    }
  }

  // Get real installed apps from device
  async getRealInstalledApps(): Promise<RealAppData[]> {
    try {
      console.log('📱 Fetching REAL installed apps from your device...');
      
      // Try native module first
      const { NativeModules } = require('react-native');
      const { InstalledApps } = NativeModules;
      
      if (InstalledApps && InstalledApps.getInstalledApps) {
        console.log('Native module found, getting real apps...');
        const apps = await InstalledApps.getInstalledApps();
        console.log(`✅ Got ${apps.length} REAL apps from your device:`);
        
        // Log first few app names to verify they're real
        apps.slice(0, 5).forEach((app: any) => {
          console.log(`- ${app.appName} (${app.packageName})`);
        });
        
        // Convert native module format to our format
        return apps.map((app: any) => ({
          packageName: app.packageName,
          appName: app.appName,
          versionName: app.versionName,
          versionCode: app.versionCode,
          permissions: app.permissions || [],
          installTime: app.installTime,
          lastUpdateTime: app.lastUpdateTime,
          size: app.size,
          isSystemApp: app.isSystemApp
        }));
      } else {
        console.log('Native module not available, checking if it\'s registered...');
        console.log('Available native modules:', Object.keys(NativeModules));
        throw new Error('InstalledApps native module not found');
      }
    } catch (error) {
      console.log('⚠️ Native module failed:', error.message);
      console.log('Falling back to mock data - you need to build the Android app to get real apps');
      return this.generateRealisticApps();
    }
  }

  // Scan apps for real threats using multiple sources
  async scanAppsForThreats(apps: RealAppData[]): Promise<AppScanResult> {
    try {
      console.log(`Scanning ${apps.length} apps for threats...`);
      
      const results: ThreatAnalysis[] = [];
      
      for (const app of apps) {
        const analysis = await this.analyzeApp(app);
        results.push(analysis);
      }
      
      return {
        success: true,
        scannedApps: apps.length,
        results,
        scanTime: new Date().toISOString()
      };
    } catch (error) {
      console.error('Threat scanning failed:', error);
      throw error;
    }
  }

  // Analyze individual app
  private async analyzeApp(app: RealAppData): Promise<ThreatAnalysis> {
    try {
      // Try multiple threat intelligence sources
      const [abuseIPDBResult, backendResult] = await Promise.allSettled([
        this.checkAbuseIPDB(app.packageName),
        this.checkBackendThreatDB(app)
      ]);

      // Combine results
      let threatLevel: 'low' | 'medium' | 'high' = 'low';
      let threats: string[] = [];
      let recommendations: string[] = [];
      let privacyScore = 85;
      let securityScore = 90;

      // Process AbuseIPDB results
      if (abuseIPDBResult.status === 'fulfilled' && abuseIPDBResult.value) {
        const abuseData = abuseIPDBResult.value;
        if (abuseData.abuseConfidenceScore > 75) {
          threatLevel = 'high';
          threats.push('High abuse confidence score from threat intelligence');
          recommendations.push('This app may be associated with malicious activity');
        } else if (abuseData.abuseConfidenceScore > 25) {
          threatLevel = 'medium';
          threats.push('Moderate abuse confidence score detected');
          recommendations.push('Monitor this app closely');
        }
      }

      // Process backend results
      if (backendResult.status === 'fulfilled' && backendResult.value) {
        const backendData = backendResult.value;
        threatLevel = backendData.threatLevel;
        threats.push(...backendData.threats);
        recommendations.push(...backendData.recommendations);
      }

      // Analyze permissions for privacy/security risks
      const permissionAnalysis = this.analyzePermissions(app.permissions);
      threats.push(...permissionAnalysis.threats);
      recommendations.push(...permissionAnalysis.recommendations);
      privacyScore = permissionAnalysis.privacyScore;
      securityScore = permissionAnalysis.securityScore;

      // Determine final threat level
      if (threats.length > 3 || permissionAnalysis.privacyScore < 50) {
        threatLevel = 'high';
      } else if (threats.length > 1 || permissionAnalysis.privacyScore < 70) {
        threatLevel = 'medium';
      }

      return {
        packageName: app.packageName,
        threatLevel,
        threats: [...new Set(threats)], // Remove duplicates
        recommendations: [...new Set(recommendations)],
        privacyScore,
        securityScore
      };
    } catch (error) {
      console.error(`Failed to analyze ${app.packageName}:`, error);
      
      // Return safe default
      return {
        packageName: app.packageName,
        threatLevel: 'low',
        threats: [],
        recommendations: [],
        privacyScore: 80,
        securityScore: 85
      };
    }
  }

  // Check AbuseIPDB API for app reputation (now handled by backend)
  private async checkAbuseIPDB(packageName: string): Promise<any> {
    console.log('AbuseIPDB API key not configured');
    return null; // This is now handled by the backend service
  }

  // Check backend threat database
  private async checkBackendThreatDB(app: RealAppData): Promise<any> {
    try {
      const response = await http.post('/api/apps/threat-analysis', {
        packageName: app.packageName,
        permissions: app.permissions,
        isSystemApp: app.isSystemApp
      });
      
      return response.data;
    } catch (error) {
      console.log('Backend threat DB check failed:', error);
      return null;
    }
  }

  // Analyze app permissions for privacy/security risks
  private analyzePermissions(permissions: string[]): {
    threats: string[];
    recommendations: string[];
    privacyScore: number;
    securityScore: number;
  } {
    const threats: string[] = [];
    const recommendations: string[] = [];
    let privacyScore = 100;
    let securityScore = 100;

    const riskyPermissions = {
      'android.permission.READ_CONTACTS': { privacy: -15, threat: 'Can access your contacts' },
      'android.permission.READ_SMS': { privacy: -20, threat: 'Can read your text messages' },
      'android.permission.ACCESS_FINE_LOCATION': { privacy: -10, threat: 'Can track your precise location' },
      'android.permission.RECORD_AUDIO': { privacy: -15, threat: 'Can record audio without notification' },
      'android.permission.CAMERA': { privacy: -10, threat: 'Can access camera' },
      'android.permission.READ_CALL_LOG': { privacy: -15, threat: 'Can access call history' },
      'android.permission.WRITE_EXTERNAL_STORAGE': { security: -5, threat: 'Can modify files on device' },
      'android.permission.INSTALL_PACKAGES': { security: -20, threat: 'Can install other apps' },
      'android.permission.SYSTEM_ALERT_WINDOW': { security: -10, threat: 'Can display over other apps' }
    };

    permissions.forEach(permission => {
      const risk = riskyPermissions[permission as keyof typeof riskyPermissions];
      if (risk) {
        if (risk.privacy) privacyScore += risk.privacy;
        if (risk.security) securityScore += risk.security;
        threats.push(risk.threat);
      }
    });

    // Generate recommendations based on threats
    if (threats.length > 0) {
      recommendations.push('Review app permissions in settings');
      if (privacyScore < 70) {
        recommendations.push('Consider using privacy-focused alternatives');
      }
      if (securityScore < 70) {
        recommendations.push('Monitor app behavior closely');
      }
    }

    return {
      threats,
      recommendations,
      privacyScore: Math.max(0, privacyScore),
      securityScore: Math.max(0, securityScore)
    };
  }

  // Generate realistic app data for testing
  private generateRealisticApps(): RealAppData[] {
    const apps = [
      {
        packageName: 'com.whatsapp',
        appName: 'WhatsApp',
        versionName: '2.23.24.14',
        versionCode: 232414,
        permissions: ['android.permission.READ_CONTACTS', 'android.permission.CAMERA', 'android.permission.RECORD_AUDIO'],
        installTime: Date.now() - 86400000 * 30,
        lastUpdateTime: Date.now() - 86400000 * 7,
        size: 157286400,
        isSystemApp: false
      },
      {
        packageName: 'com.instagram.android',
        appName: 'Instagram',
        versionName: '302.0.0.23.114',
        versionCode: 302000023,
        permissions: ['android.permission.CAMERA', 'android.permission.ACCESS_FINE_LOCATION', 'android.permission.READ_CONTACTS'],
        installTime: Date.now() - 86400000 * 60,
        lastUpdateTime: Date.now() - 86400000 * 3,
        size: 134217728,
        isSystemApp: false
      },
      {
        packageName: 'com.zhiliaoapp.musically',
        appName: 'TikTok',
        versionName: '32.5.4',
        versionCode: 2023205040,
        permissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO', 'android.permission.ACCESS_FINE_LOCATION', 'android.permission.READ_CONTACTS'],
        installTime: Date.now() - 86400000 * 15,
        lastUpdateTime: Date.now() - 86400000 * 2,
        size: 201326592,
        isSystemApp: false
      }
    ];

    return apps;
  }
}

export const realAppScanner = new RealAppScanner();