const express = require('express');
const router = express.Router();
const axios = require('axios');
const abuseIPDBService = require('../services/abuseIPDBService');

// Get installed apps endpoint (both /installed and / for compatibility)
router.get('/', async (req, res) => {
  try {
    console.log('📱 Apps endpoint hit from:', req.ip);
    
    // Return realistic app data for testing
    const apps = [
      {
        packageName: 'com.whatsapp',
        appName: 'WhatsApp',
        versionName: '2.23.24.14',
        versionCode: 232414,
        permissions: [
          'android.permission.READ_CONTACTS',
          'android.permission.CAMERA',
          'android.permission.RECORD_AUDIO',
          'android.permission.ACCESS_FINE_LOCATION',
          'android.permission.READ_PHONE_STATE'
        ],
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
        permissions: [
          'android.permission.CAMERA',
          'android.permission.ACCESS_FINE_LOCATION',
          'android.permission.READ_CONTACTS',
          'android.permission.WRITE_EXTERNAL_STORAGE'
        ],
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
        permissions: [
          'android.permission.CAMERA',
          'android.permission.RECORD_AUDIO',
          'android.permission.ACCESS_FINE_LOCATION',
          'android.permission.READ_CONTACTS',
          'android.permission.READ_PHONE_STATE',
          'android.permission.WRITE_EXTERNAL_STORAGE'
        ],
        installTime: Date.now() - 86400000 * 15,
        lastUpdateTime: Date.now() - 86400000 * 2,
        size: 201326592,
        isSystemApp: false
      },
      {
        packageName: 'com.google.android.gm',
        appName: 'Gmail',
        versionName: '2023.10.29.574908288',
        versionCode: 574908288,
        permissions: [
          'android.permission.READ_CONTACTS',
          'android.permission.GET_ACCOUNTS',
          'android.permission.INTERNET'
        ],
        installTime: Date.now() - 86400000 * 90,
        lastUpdateTime: Date.now() - 86400000 * 5,
        size: 89478485,
        isSystemApp: false
      },
      {
        packageName: 'com.google.android.youtube',
        appName: 'YouTube',
        versionName: '18.43.45',
        versionCode: 1843450000,
        permissions: [
          'android.permission.INTERNET',
          'android.permission.ACCESS_NETWORK_STATE',
          'android.permission.CAMERA',
          'android.permission.RECORD_AUDIO'
        ],
        installTime: Date.now() - 86400000 * 120,
        lastUpdateTime: Date.now() - 86400000 * 1,
        size: 156789123,
        isSystemApp: false
      }
    ];
    
    console.log(`✅ Returning ${apps.length} installed apps`);
    res.json({ apps, count: apps.length });
  } catch (error) {
    console.error('❌ Error fetching installed apps:', error);
    res.status(500).json({ error: 'Failed to fetch installed apps' });
  }
});

router.get('/installed', async (req, res) => {
  try {
    console.log('📱 Fetching installed apps...');
    
    // Simulate real app data with realistic information
    const apps = [
      {
        packageName: 'com.whatsapp',
        appName: 'WhatsApp',
        versionName: '2.23.24.14',
        versionCode: 232414,
        permissions: [
          'android.permission.READ_CONTACTS',
          'android.permission.CAMERA',
          'android.permission.RECORD_AUDIO',
          'android.permission.ACCESS_FINE_LOCATION',
          'android.permission.READ_PHONE_STATE'
        ],
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
        permissions: [
          'android.permission.CAMERA',
          'android.permission.ACCESS_FINE_LOCATION',
          'android.permission.READ_CONTACTS',
          'android.permission.WRITE_EXTERNAL_STORAGE'
        ],
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
        permissions: [
          'android.permission.CAMERA',
          'android.permission.RECORD_AUDIO',
          'android.permission.ACCESS_FINE_LOCATION',
          'android.permission.READ_CONTACTS',
          'android.permission.READ_PHONE_STATE',
          'android.permission.WRITE_EXTERNAL_STORAGE'
        ],
        installTime: Date.now() - 86400000 * 15,
        lastUpdateTime: Date.now() - 86400000 * 2,
        size: 201326592,
        isSystemApp: false
      },
      {
        packageName: 'com.google.android.gm',
        appName: 'Gmail',
        versionName: '2023.10.29.574908288',
        versionCode: 574908288,
        permissions: [
          'android.permission.READ_CONTACTS',
          'android.permission.GET_ACCOUNTS',
          'android.permission.INTERNET'
        ],
        installTime: Date.now() - 86400000 * 90,
        lastUpdateTime: Date.now() - 86400000 * 5,
        size: 89478485,
        isSystemApp: false
      },
      {
        packageName: 'com.google.android.youtube',
        appName: 'YouTube',
        versionName: '18.43.45',
        versionCode: 1843450000,
        permissions: [
          'android.permission.INTERNET',
          'android.permission.ACCESS_NETWORK_STATE',
          'android.permission.CAMERA',
          'android.permission.RECORD_AUDIO'
        ],
        installTime: Date.now() - 86400000 * 120,
        lastUpdateTime: Date.now() - 86400000 * 1,
        size: 156789123,
        isSystemApp: false
      }
    ];
    
    console.log(`✅ Returning ${apps.length} installed apps`);
    res.json({ apps, count: apps.length });
  } catch (error) {
    console.error('❌ Error fetching installed apps:', error);
    res.status(500).json({ error: 'Failed to fetch installed apps' });
  }
});

// Threat analysis endpoint with AbuseIPDB integration
router.post('/threat-analysis', async (req, res) => {
  try {
    const { packageName, permissions, isSystemApp } = req.body;
    console.log(`🔍 Analyzing threats for: ${packageName}`);
    
    let threatLevel = 'low';
    let threats = [];
    let recommendations = [];
    let privacyScore = 85;
    let securityScore = 90;
    
    // Check AbuseIPDB for additional threat intelligence
    try {
      const abuseResult = await abuseIPDBService.getAppThreatScore(packageName);
      
      if (abuseResult.configured) {
        console.log('🛡️ AbuseIPDB threat intelligence check completed');
        
        if (abuseResult.score > 75) {
          threatLevel = 'high';
          threats.push(`High abuse confidence score: ${abuseResult.score}%`);
          recommendations.push('This app may be associated with malicious activity');
          securityScore -= 30;
        } else if (abuseResult.score > 25) {
          threatLevel = threatLevel === 'low' ? 'medium' : threatLevel;
          threats.push(`Moderate abuse confidence score: ${abuseResult.score}%`);
          securityScore -= 10;
        }
        
        if (abuseResult.reports > 5) {
          threats.push(`Multiple abuse reports: ${abuseResult.reports}`);
        }
      } else {
        console.log('AbuseIPDB API key not configured - using fallback threat detection');
      }
    } catch (abuseError) {
      console.log('AbuseIPDB check failed:', abuseError.message);
    }
    
    // Known high-risk apps database
    const highRiskApps = {
      'com.zhiliaoapp.musically': {
        threatLevel: 'high',
        threats: [
          'Excessive data collection',
          'Privacy policy concerns',
          'Potential data sharing with third parties',
          'Location tracking without clear purpose'
        ],
        recommendations: [
          'Review privacy settings immediately',
          'Disable location access',
          'Limit contact access',
          'Consider alternative apps'
        ],
        privacyScore: 35,
        securityScore: 60
      },
      'com.facebook.katana': {
        threatLevel: 'high',
        threats: [
          'Extensive data mining',
          'Cross-app tracking',
          'Privacy violations',
          'Aggressive data collection'
        ],
        recommendations: [
          'Review all privacy settings',
          'Disable ad personalization',
          'Limit app permissions',
          'Consider deactivating account'
        ],
        privacyScore: 25,
        securityScore: 55
      },
      'com.instagram.android': {
        threatLevel: 'medium',
        threats: [
          'Location tracking',
          'Contact access for advertising',
          'Photo metadata collection',
          'Cross-platform data sharing'
        ],
        recommendations: [
          'Review photo permissions',
          'Disable location services',
          'Check privacy settings',
          'Limit contact access'
        ],
        privacyScore: 55,
        securityScore: 70
      },
      'com.whatsapp': {
        threatLevel: 'medium',
        threats: [
          'Contact list access',
          'Backup data concerns',
          'Metadata collection'
        ],
        recommendations: [
          'Review backup settings',
          'Check contact permissions',
          'Enable two-factor authentication'
        ],
        privacyScore: 70,
        securityScore: 80
      }
    };
    
    // Check if app is in known risk database
    if (highRiskApps[packageName]) {
      const riskData = highRiskApps[packageName];
      threatLevel = riskData.threatLevel;
      threats = riskData.threats;
      recommendations = riskData.recommendations;
      privacyScore = riskData.privacyScore;
      securityScore = riskData.securityScore;
    } else {
      // Analyze based on permissions
      const riskyPermissions = {
        'android.permission.READ_SMS': { privacy: -20, threat: 'Can read your text messages' },
        'android.permission.READ_CALL_LOG': { privacy: -15, threat: 'Can access call history' },
        'android.permission.RECORD_AUDIO': { privacy: -15, threat: 'Can record audio without notification' },
        'android.permission.ACCESS_FINE_LOCATION': { privacy: -10, threat: 'Can track your precise location' },
        'android.permission.READ_CONTACTS': { privacy: -15, threat: 'Can access your contacts' },
        'android.permission.CAMERA': { privacy: -10, threat: 'Can access camera' },
        'android.permission.READ_PHONE_STATE': { privacy: -10, threat: 'Can access device information' },
        'android.permission.WRITE_EXTERNAL_STORAGE': { security: -5, threat: 'Can modify files on device' },
        'android.permission.INSTALL_PACKAGES': { security: -20, threat: 'Can install other apps' },
        'android.permission.SYSTEM_ALERT_WINDOW': { security: -10, threat: 'Can display over other apps' }
      };
      
      permissions.forEach(permission => {
        const risk = riskyPermissions[permission];
        if (risk) {
          if (risk.privacy) privacyScore += risk.privacy;
          if (risk.security) securityScore += risk.security;
          threats.push(risk.threat);
        }
      });
      
      // Determine threat level based on scores
      if (privacyScore < 50 || securityScore < 50) {
        threatLevel = 'high';
      } else if (privacyScore < 70 || securityScore < 70) {
        threatLevel = 'medium';
      }
      
      // Generate recommendations
      if (threats.length > 0) {
        recommendations.push('Review app permissions in settings');
        if (privacyScore < 70) {
          recommendations.push('Consider privacy-focused alternatives');
        }
        if (securityScore < 70) {
          recommendations.push('Monitor app behavior closely');
        }
      }
    }
    
    const result = {
      packageName,
      threatLevel,
      threats: [...new Set(threats)], // Remove duplicates
      recommendations: [...new Set(recommendations)],
      privacyScore: Math.max(0, privacyScore),
      securityScore: Math.max(0, securityScore),
      analyzedAt: new Date().toISOString()
    };
    
    console.log(`✅ Threat analysis complete for ${packageName}: ${threatLevel} risk`);
    res.json(result);
  } catch (error) {
    console.error('❌ Error in threat analysis:', error);
    res.status(500).json({ error: 'Failed to analyze app threats' });
  }
});

// Health check for apps service
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Apps API',
    timestamp: new Date().toISOString() 
  });
});

module.exports = router;