interface AppData {
  packageName: string;
  appName: string;
  permissions: string[];
  versionName: string;
  versionCode: number;
  networkConnections?: string[];
}

interface ThreatScanResult {
  packageName: string;
  threatLevel: 'low' | 'medium' | 'high';
  threats: string[];
  lastScanned: Date;
  recommendations: string[];
}

class ThreatScannerService {
  private static instance: ThreatScannerService;
  private readonly DANGEROUS_PERMISSIONS = [
    'android.permission.READ_SMS',
    'android.permission.SEND_SMS',
    'android.permission.RECEIVE_SMS',
    'android.permission.RECORD_AUDIO',
    'android.permission.CAMERA',
    'android.permission.READ_CONTACTS',
    'android.permission.READ_CALL_LOG',
    'android.permission.READ_PHONE_STATE',
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.SYSTEM_ALERT_WINDOW',
    'android.permission.GET_ACCOUNTS',
  ];

  private constructor() {}

  public static getInstance(): ThreatScannerService {
    if (!ThreatScannerService.instance) {
      ThreatScannerService.instance = new ThreatScannerService();
    }
    return ThreatScannerService.instance;
  }

  public async scanApp(appData: AppData): Promise<ThreatScanResult> {
    const threats: string[] = [];
    const recommendations: string[] = [];
    let threatLevel: 'low' | 'medium' | 'high' = 'low';

    // Check dangerous permissions
    const dangerousPermissions = appData.permissions.filter(
      permission => this.DANGEROUS_PERMISSIONS.includes(permission)
    );

    if (dangerousPermissions.length > 0) {
      threats.push(`App requests ${dangerousPermissions.length} dangerous permissions`);
      dangerousPermissions.forEach(permission => {
        threats.push(`Uses dangerous permission: ${permission}`);
      });

      if (dangerousPermissions.length >= 3) {
        threatLevel = 'high';
        recommendations.push('Review and restrict app permissions');
        recommendations.push('Consider uninstalling or finding alternative app');
      } else if (dangerousPermissions.length >= 1) {
        threatLevel = 'medium';
        recommendations.push('Review app permissions and restrict if possible');
      }
    }

    // Check for suspicious permission combinations
    const hasSMSAndContacts = appData.permissions.includes('android.permission.READ_SMS') && 
                             appData.permissions.includes('android.permission.READ_CONTACTS');
    const hasLocationAndAudio = appData.permissions.includes('android.permission.ACCESS_FINE_LOCATION') && 
                               appData.permissions.includes('android.permission.RECORD_AUDIO');

    if (hasSMSAndContacts) {
      threats.push('Suspicious combination: SMS and Contacts access');
      threatLevel = 'high';
    }
    if (hasLocationAndAudio) {
      threats.push('Suspicious combination: Location and Audio recording');
      threatLevel = 'high';
    }

    // Add basic recommendations
    if (threats.length > 0 && recommendations.length === 0) {
      recommendations.push('Monitor app behavior and network activity');
      if (threatLevel === 'high') {
        recommendations.push('Consider using app in restricted mode or finding alternative');
      }
    }

    return {
      packageName: appData.packageName,
      threatLevel,
      threats,
      lastScanned: new Date(),
      recommendations
    };
  }

  public async bulkScan(apps: AppData[]): Promise<ThreatScanResult[]> {
    return Promise.all(apps.map(app => this.scanApp(app)));
  }
}

export default ThreatScannerService; 