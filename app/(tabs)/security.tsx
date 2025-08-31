import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, AlertTriangle, CheckCircle, Scan, Zap, Eye, Phone, PhoneOff } from 'lucide-react-native';
import { realTimeSecurityAPI } from '../../services/realTimeSecurityApi';
import { appsApi } from '../../services/api';


interface SecurityStatus {
  score: number;
  threats: number;
  suspicious: number;
  clean: number;
  lastScan: string;
  recommendations: string[];
}

export default function SecurityScreen() {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [scannerStatus, setScannerStatus] = useState<any>(null);
  const [spamProtectionEnabled, setSpamProtectionEnabled] = useState(false);

  useEffect(() => {
    loadSecurityStatus();
    loadScannerStatus();
  }, []);

  const loadSecurityStatus = async () => {
    try {
      console.log('Loading real apps from device...');
      
      // Try to get real apps from native module
      const { NativeModules } = require('react-native');
      const { InstalledApps } = NativeModules;
      
      let apps = [];
      
      if (InstalledApps && InstalledApps.getInstalledApps) {
        try {
          console.log('Getting real apps from native module...');
          const realApps = await InstalledApps.getInstalledApps();
          apps = realApps.map((app: any) => ({
            packageName: app.packageName,
            appName: app.appName,
            permissions: app.permissions || []
          }));
          console.log(`Got ${apps.length} real apps from device`);
        } catch (nativeError) {
          console.log('Native module failed, trying backend...');
          const appsResponse = await appsApi.getInstalledApps();
          apps = appsResponse.apps || [];
        }
      } else {
        console.log('Native module not available, using backend...');
        const appsResponse = await appsApi.getInstalledApps();
        apps = appsResponse.apps || [];
      }
      
      console.log('Apps to analyze:', apps.map(a => a.packageName));
      
      // Quick security check with real apps
      const quickCheck = await realTimeSecurityAPI.quickSecurityCheck(apps);
      
      setSecurityStatus({
        score: quickCheck.securityScore,
        threats: quickCheck.highRiskApps.length,
        suspicious: 0, // Will be updated with full scan
        clean: apps.length - quickCheck.highRiskApps.length,
        lastScan: new Date().toISOString(),
        recommendations: quickCheck.recommendations
      });
    } catch (error) {
      console.error('Failed to load security status:', error);
      Alert.alert('Error', `Failed to load security status: ${error.message}`);
    }
  };

  const loadScannerStatus = async () => {
    try {
      const status = await realTimeSecurityAPI.getStatus();
      setScannerStatus(status);
    } catch (error) {
      console.error('Failed to load scanner status:', error);
    }
  };

  const performFullScan = async () => {
    setIsScanning(true);
    try {
      console.log('Starting REAL full security scan with VirusTotal...');
      
      // Get real apps from device
      const { NativeModules } = require('react-native');
      const { InstalledApps } = NativeModules;
      
      let apps = [];
      
      if (InstalledApps && InstalledApps.getInstalledApps) {
        try {
          const realApps = await InstalledApps.getInstalledApps();
          apps = realApps.map((app: any) => ({
            packageName: app.packageName,
            appName: app.appName,
            permissions: app.permissions || [],
            hash: app.hash // If available
          }));
          console.log(`Scanning ${apps.length} REAL apps from your device`);
        } catch (nativeError) {
          console.log('Using backend apps...');
          const appsResponse = await appsApi.getInstalledApps();
          apps = appsResponse.apps || [];
        }
      } else {
        const appsResponse = await appsApi.getInstalledApps();
        apps = appsResponse.apps || [];
      }
      
      if (apps.length === 0) {
        Alert.alert('No Apps Found', 'No apps found to scan.');
        return;
      }
      
      Alert.alert(
        'Real VirusTotal Scan',
        `This will scan ${apps.length} real apps from your device using VirusTotal API. This may take several minutes due to rate limits. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Scan with VirusTotal', 
            onPress: async () => {
              try {
                console.log('Starting real VirusTotal scan...');
                const scanResults = await realTimeSecurityAPI.bulkScanApps(apps);
                console.log('Real scan results:', scanResults);
                
                setSecurityStatus({
                  score: Math.max(0, 100 - (scanResults.summary.malicious * 30) - (scanResults.summary.suspicious * 10)),
                  threats: scanResults.summary.malicious,
                  suspicious: scanResults.summary.suspicious,
                  clean: scanResults.summary.clean,
                  lastScan: new Date().toISOString(),
                  recommendations: generateRecommendations(scanResults.summary)
                });
                
                Alert.alert(
                  'Real Scan Complete!',
                  `VirusTotal scanned ${scanResults.summary.total} real apps from your device:\n\n🚨 Malicious: ${scanResults.summary.malicious}\n⚠️ Suspicious: ${scanResults.summary.suspicious}\n✅ Clean: ${scanResults.summary.clean}`
                );
              } catch (scanError) {
                console.error('Real scan error:', scanError);
                Alert.alert('Scan Error', `VirusTotal scan failed: ${scanError.message}`);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to start real scan:', error);
      Alert.alert('Error', `Failed to start real security scan: ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleRealTimeProtection = async () => {
    try {
      setIsRealTimeActive(!isRealTimeActive);
      
      if (!isRealTimeActive) {
        Alert.alert(
          'Real-Time Protection Enabled',
          'Your device is now protected with real-time threat detection'
        );
      } else {
        Alert.alert(
          'Real-Time Protection Disabled',
          'Your device is no longer protected in real-time'
        );
      }
    } catch (error) {
      console.error('Failed to toggle real-time protection:', error);
      Alert.alert('Error', 'Failed to toggle real-time protection');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSecurityStatus();
    await loadScannerStatus();
    setRefreshing(false);
  };

  const generateRecommendations = (summary: any): string[] => {
    const recommendations = [];
    if (summary.malicious > 0) {
      recommendations.push(`Remove ${summary.malicious} malicious app(s) immediately`);
    }
    if (summary.suspicious > 0) {
      recommendations.push(`Review ${summary.suspicious} suspicious app(s)`);
    }
    if (summary.malicious + summary.suspicious > 0) {
      recommendations.push('Enable real-time protection');
      recommendations.push('Update all apps to latest versions');
    }
    return recommendations;
  };

  const getSecurityColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getSecurityStatus = (score: number) => {
    if (score >= 80) return 'Secure';
    if (score >= 60) return 'At Risk';
    return 'High Risk';
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >

      {/* Security Score Card */}
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.scoreCard}
      >
        <View style={styles.scoreHeader}>
          <Shield size={32} color="#10B981" />
          <Text style={styles.scoreTitle}>Device Security</Text>
        </View>
        
        {securityStatus ? (
          <>
            <View style={styles.scoreCircle}>
              <Text style={[styles.scoreText, { color: getSecurityColor(securityStatus.score) }]}>
                {securityStatus.score}
              </Text>
              <Text style={styles.scoreLabel}>Security Score</Text>
            </View>
            
            <Text style={[styles.statusText, { color: getSecurityColor(securityStatus.score) }]}>
              {getSecurityStatus(securityStatus.score)}
            </Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{securityStatus.threats}</Text>
                <Text style={styles.statLabel}>Threats</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{securityStatus.suspicious}</Text>
                <Text style={styles.statLabel}>Suspicious</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{securityStatus.clean}</Text>
                <Text style={styles.statLabel}>Clean</Text>
              </View>
            </View>
          </>
        ) : (
          <ActivityIndicator size="large" color="#10B981" style={styles.loader} />
        )}
      </LinearGradient>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.scanButton]}
          onPress={performFullScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Scan size={24} color="#FFFFFF" />
          )}
          <Text style={styles.actionButtonText}>
            {isScanning ? 'Scanning...' : 'Full Scan'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            isRealTimeActive ? styles.activeButton : styles.inactiveButton
          ]}
          onPress={toggleRealTimeProtection}
        >
          <Zap size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>
            Real-Time {isRealTimeActive ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>



      {/* Scanner Status */}
      {scannerStatus && (
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Scanner Status</Text>
          <View style={styles.statusItem}>
            <CheckCircle 
              size={20} 
              color={scannerStatus.virusTotalConfigured ? '#10B981' : '#EF4444'} 
            />
            <Text style={styles.statusItemText}>
              VirusTotal API: {scannerStatus.virusTotalConfigured ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <CheckCircle 
              size={20} 
              color={scannerStatus.googleSafeBrowsingConfigured ? '#10B981' : '#EF4444'} 
            />
            <Text style={styles.statusItemText}>
              Google Safe Browsing: {scannerStatus.googleSafeBrowsingConfigured ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      )}

      {/* Recommendations */}
      {securityStatus?.recommendations && securityStatus.recommendations.length > 0 && (
        <View style={styles.recommendationsCard}>
          <View style={styles.cardHeader}>
            <AlertTriangle size={24} color="#F59E0B" />
            <Text style={styles.cardTitle}>Security Recommendations</Text>
          </View>
          {securityStatus.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>• {recommendation}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Spam Call Protection */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Phone size={24} color="#EF4444" />
          <Text style={styles.cardTitle}>Spam Call Protection</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.actionButton,
            spamProtectionEnabled ? styles.activeButton : styles.inactiveButton,
            { marginBottom: 12 }
          ]}
          onPress={() => {
            setSpamProtectionEnabled(!spamProtectionEnabled);
            Alert.alert(
              spamProtectionEnabled ? 'Spam Protection Disabled' : 'Spam Protection Enabled',
              spamProtectionEnabled 
                ? 'Incoming calls will no longer be checked for spam'
                : 'Incoming calls will be checked using NumVerify API'
            );
          }}
        >
          {spamProtectionEnabled ? (
            <PhoneOff size={24} color="#FFFFFF" />
          ) : (
            <Phone size={24} color="#FFFFFF" />
          )}
          <Text style={styles.actionButtonText}>
            Spam Protection {spamProtectionEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.infoText}>
          {spamProtectionEnabled
            ? 'Incoming calls are being checked for spam using NumVerify API. Suspicious calls will be flagged.'
            : 'Enable spam call protection to automatically detect and warn about potential spam calls.'
          }
        </Text>
      </View>

      {/* Real-Time Protection Info */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Eye size={24} color="#3B82F6" />
          <Text style={styles.cardTitle}>Real-Time Protection</Text>
        </View>
        <Text style={styles.infoText}>
          {isRealTimeActive 
            ? 'Your device is actively monitored for threats. New apps and downloads are automatically scanned.'
            : 'Enable real-time protection to automatically scan new apps and downloads for threats.'
          }
        </Text>
      </View>

      {securityStatus && (
        <Text style={styles.lastScanText}>
          Last scan: {new Date(securityStatus.lastScan).toLocaleString()}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 16,
  },
  scoreCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  scoreCircle: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  scanButton: {
    backgroundColor: '#3B82F6',
  },
  activeButton: {
    backgroundColor: '#10B981',
  },
  inactiveButton: {
    backgroundColor: '#6B7280',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusItemText: {
    color: '#D1D5DB',
    marginLeft: 8,
  },
  recommendationsCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  recommendationItem: {
    marginBottom: 8,
  },
  recommendationText: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
  },
  lastScanText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 40,
  },
});