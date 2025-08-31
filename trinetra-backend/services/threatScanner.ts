import NetworkSecurityService from './networkSecurity';

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
  private knownThreats: Set<string>;

  private constructor() {
    this.knownThreats = new Set([
      'malware',
      'ransomware',
      'spyware',
      'adware',
      'trojan',
      'backdoor',
      'rootkit',
      'keylogger',
      'cryptominer'
    ]);
  }

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

  public async scanProcess(processName: string): Promise<{
    isThreat: boolean;
    confidence: number;
    details?: string;
  }> {
    // Convert process name to lowercase for comparison
    const processLower = processName.toLowerCase();

    // Check if process name contains any known threat patterns
    const matchedThreats = Array.from(this.knownThreats)
      .filter(threat => processLower.includes(threat));

    if (matchedThreats.length > 0) {
      return {
        isThreat: true,
        confidence: 0.8,
        details: `Process matches known threat patterns: ${matchedThreats.join(', ')}`
      };
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      'hack',
      'crack',
      'steal',
      'inject',
      'exploit'
    ];

    const matchedPatterns = suspiciousPatterns
      .filter(pattern => processLower.includes(pattern));

    if (matchedPatterns.length > 0) {
      return {
        isThreat: true,
        confidence: 0.6,
        details: `Process name contains suspicious patterns: ${matchedPatterns.join(', ')}`
      };
    }

    return {
      isThreat: false,
      confidence: 0.9
    };
  }

  public async scanNetwork(connection: {
    localAddress: string;
    remoteAddress: string;
    state: string;
  }): Promise<{
    isSuspicious: boolean;
    risk: 'low' | 'medium' | 'high';
    details?: string;
  }> {
    // Check for suspicious ports
    const suspiciousPorts = [
      '6667',  // IRC
      '1337',  // Common backdoor
      '31337', // Elite backdoor
      '4444',  // Metasploit
      '5554',  // Worm
    ];

    const [, port] = connection.remoteAddress.split(':');
    
    if (suspiciousPorts.includes(port)) {
      return {
        isSuspicious: true,
        risk: 'high',
        details: `Connection to known malicious port: ${port}`
      };
    }

    // Check for unusual connection states
    const unusualStates = ['LISTEN', 'ESTABLISHED'];
    if (!unusualStates.includes(connection.state)) {
      return {
        isSuspicious: true,
        risk: 'medium',
        details: `Unusual connection state: ${connection.state}`
      };
    }

    return {
      isSuspicious: false,
      risk: 'low'
    };
  }

  public async scanFile(filePath: string): Promise<{
    isMalicious: boolean;
    risk: 'low' | 'medium' | 'high';
    details?: string;
  }> {
    // This is a placeholder. In a real implementation,
    // you would perform actual file scanning using antivirus APIs
    return {
      isMalicious: false,
      risk: 'low'
    };
  }
}

export default ThreatScannerService; 