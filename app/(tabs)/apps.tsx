import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Platform, PermissionsAndroid, Permission, NativeModules, TextInput, Modal, Alert } from 'react-native';
import Header from '@/components/Header';
import SectionTitle from '@/components/SectionTitle';
import { Search, Shield, TriangleAlert as AlertTriangle, Lock, Unlock, Filter } from 'lucide-react-native';
import { realAppScanner, RealAppData, AppScanResult } from '@/services/realAppScanner';
// Removed problematic Expo imports

// Removed problematic native module

// Define types for the native module
interface InstalledApp {
  appName: string;
  packageName: string;
  versionName?: string;
  versionCode?: number;
  permissions?: string[];
  risk: 'low' | 'medium' | 'high';
  installTime?: number;
  lastUpdateTime?: number;
  isLocked?: boolean;
  threats?: string[];
  recommendations?: string[];
  lastScanned?: Date;
  networkThreats?: string[];
}

// Mock data for when native module is not available
const MOCK_APPS: InstalledApp[] = [
  { appName: 'Chrome', packageName: 'com.android.chrome', risk: 'low' },
  { appName: 'Gmail', packageName: 'com.google.android.gm', risk: 'low' },
  { appName: 'Maps', packageName: 'com.google.android.maps', risk: 'medium' },
];

// Custom permission for QUERY_ALL_PACKAGES since it's not in the standard PermissionsAndroid
const PERMISSIONS = {
  ...(PermissionsAndroid.PERMISSIONS || {}),
  PACKAGE_USAGE_STATS: 'android.permission.PACKAGE_USAGE_STATS' as Permission,
  QUERY_ALL_PACKAGES: 'android.permission.QUERY_ALL_PACKAGES' as Permission
};

type FilterType = 'all' | 'high' | 'medium' | 'low' | 'protected';

function AppsScreen() {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<InstalledApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [selectedApp, setSelectedApp] = useState<InstalledApp | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        // First try requesting QUERY_ALL_PACKAGES
        const queryPermission = await PermissionsAndroid.request(
          PERMISSIONS.QUERY_ALL_PACKAGES,
          {
            title: "App Access Permission",
            message: "Trinetra Security needs permission to view installed apps to protect your device",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );

        if (queryPermission !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Required',
            'Please enable "Query All Packages" permission in Settings to view installed apps.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: async () => {
                  console.log('Would open app settings');
                }
              }
            ]
          );
          return false;
        }

        // Then request PACKAGE_USAGE_STATS with a separate prompt
        const usagePermission = await PermissionsAndroid.request(
          PERMISSIONS.PACKAGE_USAGE_STATS,
          {
            title: "Usage Access Permission",
            message: "Trinetra Security needs permission to monitor app usage to ensure your security",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );

        if (usagePermission !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Additional Permission Required',
            'Please enable "Usage Access" permission in Settings for full app protection.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: async () => {
                  console.log('Would open usage settings');
                }
              }
            ]
          );
          return false;
        }

        return true;
      } catch (err) {
        console.error('Error requesting permissions:', err);
        Alert.alert(
          'Permission Error',
          'Failed to request necessary permissions. Please grant permissions manually in Settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const fetchApps = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Starting real app scan...');
      
      // Test API connection first
      const isApiWorking = await realAppScanner.testConnection();
      console.log('API Status:', isApiWorking ? '✅ Connected' : '⚠️ Using fallback');
      
      // Get real installed apps
      const realApps = await realAppScanner.getRealInstalledApps();
      console.log(`📱 Found ${realApps.length} installed apps`);
      
      // Convert to our app format
      const appsWithDetails = realApps.map(app => ({
        appName: app.appName,
        packageName: app.packageName,
        versionName: app.versionName,
        versionCode: app.versionCode,
        installTime: app.installTime,
        lastUpdateTime: app.lastUpdateTime,
        isLocked: Math.random() > 0.8,
        permissions: app.permissions,
        risk: 'low' as const, // Will be updated by threat scan
        size: app.size,
        isSystemApp: app.isSystemApp
      }));

      setApps(appsWithDetails);
      applyFilters(appsWithDetails, searchQuery, currentFilter);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error('Error in fetchApps:', error);
      setError(error.message || 'Failed to fetch installed apps');
      // Don't fallback to mock data anymore, show the error instead
      setApps([]);
      setFilteredApps([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback((appList: InstalledApp[], query: string, filter: FilterType) => {
    let filtered = [...appList];
    
    // Apply search query
    if (query) {
      filtered = filtered.filter(app => 
        app.appName.toLowerCase().includes(query.toLowerCase()) ||
        app.packageName.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply category filter
    switch (filter) {
      case 'high':
        filtered = filtered.filter(app => app.risk === 'high');
        break;
      case 'medium':
        filtered = filtered.filter(app => app.risk === 'medium');
        break;
      case 'low':
        filtered = filtered.filter(app => app.risk === 'low');
        break;
      case 'protected':
        filtered = filtered.filter(app => app.isLocked);
        break;
    }
    
    setFilteredApps(filtered);
  }, []);

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    applyFilters(apps, searchQuery, currentFilter);
  }, [apps, searchQuery, currentFilter, applyFilters]);

  const handleScanThreats = async () => {
    setScanLoading(true);
    setScanError(null);
    try {
      console.log('🛡️ Starting real-time threat scan...');
      
      // Convert apps to RealAppData format
      const realAppsData: RealAppData[] = apps.map(app => ({
        packageName: app.packageName,
        appName: app.appName,
        versionName: app.versionName || '1.0.0',
        versionCode: app.versionCode || 1,
        permissions: app.permissions || [],
        installTime: app.installTime || Date.now(),
        lastUpdateTime: app.lastUpdateTime || Date.now(),
        size: (app as any).size || 50000000,
        isSystemApp: (app as any).isSystemApp || false
      }));
      
      // Perform real threat analysis
      const scanResult: AppScanResult = await realAppScanner.scanAppsForThreats(realAppsData);
      console.log(`✅ Scanned ${scanResult.scannedApps} apps, found ${scanResult.results.filter(r => r.threatLevel === 'high').length} high-risk apps`);
      
      // Update apps with real threat analysis
      const updatedApps = apps.map(app => {
        const analysis = scanResult.results.find(r => r.packageName === app.packageName);
        
        if (analysis) {
          return {
            ...app,
            risk: analysis.threatLevel,
            threats: analysis.threats,
            recommendations: analysis.recommendations,
            lastScanned: new Date(),
            privacyScore: analysis.privacyScore,
            securityScore: analysis.securityScore
          };
        }
        
        return {
          ...app,
          lastScanned: new Date()
        };
      });

      setApps(updatedApps);
      applyFilters(updatedApps, searchQuery, currentFilter);

      // Show detailed security alert
      const highRiskApps = updatedApps.filter(app => app.risk === 'high');
      const mediumRiskApps = updatedApps.filter(app => app.risk === 'medium');
      
      if (highRiskApps.length > 0 || mediumRiskApps.length > 0) {
        Alert.alert(
          '🛡️ Security Scan Complete',
          `Found ${highRiskApps.length} high-risk and ${mediumRiskApps.length} medium-risk apps.\n\nHigh-risk apps: ${highRiskApps.map(app => app.appName).join(', ')}`,
          [{ text: 'Review Apps', onPress: () => setCurrentFilter('high') }, { text: 'OK' }]
        );
      } else {
        Alert.alert(
          '✅ All Clear',
          'No high-risk apps detected. Your device is secure!',
          [{ text: 'OK' }]
        );
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setScanError(error.message || 'Failed to scan for threats');
      console.error('Scan error:', error);
    } finally {
      setScanLoading(false);
    }
  };

  const toggleAppLock = async (app: InstalledApp) => {
    try {
      const newLockStatus = !app.isLocked;
      // Update the UI optimistically
      setApps(prevApps => 
        prevApps.map(a => 
          a.packageName === app.packageName 
            ? { ...a, isLocked: newLockStatus }
            : a
        )
      );
      
      // Show feedback to user
      Alert.alert(
        'App Lock Status',
        `${app.appName} has been ${newLockStatus ? 'locked' : 'unlocked'}`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to update app lock status');
    }
  };

  const showAppDetails = (app: InstalledApp) => {
    setSelectedApp(app);
    setShowPermissionsModal(true);
  };

  const getRiskColor = (risk: string | undefined) => {
    switch(risk) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffa94d';
      case 'low': return '#2e7d32';
      default: return '#888';
    }
  };

  const renderPermissionsModal = () => (
    <Modal
      visible={showPermissionsModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPermissionsModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{selectedApp?.appName}</Text>
          
          {/* Risk Level Section */}
          <View style={[styles.riskSection, { backgroundColor: getRiskColor(selectedApp?.risk) + '20' }]}>
            <Text style={[styles.riskTitle, { color: getRiskColor(selectedApp?.risk) }]}>
              {selectedApp?.risk?.toUpperCase()} RISK
            </Text>
            {selectedApp?.threats && selectedApp.threats.length > 0 && (
              <View style={styles.threatsList}>
                {selectedApp.threats.map((threat, index) => (
                  <Text key={index} style={styles.threatText}>• {threat}</Text>
                ))}
              </View>
            )}
          </View>

          {/* Recommendations Section */}
          {selectedApp?.recommendations && selectedApp.recommendations.length > 0 && (
            <View style={styles.recommendationsSection}>
              <Text style={styles.recommendationsTitle}>Recommendations</Text>
              {selectedApp.recommendations.map((rec, index) => (
                <Text key={index} style={styles.recommendationText}>• {rec}</Text>
              ))}
            </View>
          )}

          <Text style={styles.modalSubtitle}>Permissions</Text>
          <ScrollView style={styles.permissionsList}>
            {selectedApp?.permissions?.map((permission, index) => (
              <View key={index} style={styles.permissionItem}>
                <Text style={styles.permissionText}>{permission.replace('android.permission.', '')}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Last Scanned Time */}
          {selectedApp?.lastScanned && (
            <Text style={styles.lastScannedText}>
              Last scanned: {new Date(selectedApp.lastScanned).toLocaleString()}
            </Text>
          )}

          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setShowPermissionsModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  
  return (
    <View style={styles.container}>
      <Header title="Trinetra Security" />
      <SectionTitle title="Apps" />
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search apps..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#888"
          />
        </View>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{apps.length}</Text>
              <Text style={styles.summaryLabel}>Total Apps</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {apps.filter(a => a.risk === 'high').length || 0}
              </Text>
              <Text style={styles.summaryLabel}>High Risk</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {apps.filter(a => a.risk === 'medium').length || 0}
              </Text>
              <Text style={styles.summaryLabel}>Medium Risk</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.scanButton} 
            onPress={handleScanThreats}
            disabled={scanLoading}
          >
            <Shield size={16} color="#fff" />
            <Text style={styles.scanButtonText}>
              {scanLoading ? 'Scanning...' : 'Scan for Threats'}
            </Text>
          </TouchableOpacity>
          {scanError && (
            <Text style={styles.errorText}>{scanError}</Text>
          )}
        </View>
        <View style={styles.categoryTabs}>
          <TouchableOpacity 
            style={[styles.categoryTab, currentFilter === 'all' && styles.activeTab]}
            onPress={() => setCurrentFilter('all')}
          >
            <Text style={[styles.categoryTabText, currentFilter === 'all' && styles.activeTabText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.categoryTab, currentFilter === 'high' && styles.activeTab]}
            onPress={() => setCurrentFilter('high')}
          >
            <Text style={[styles.categoryTabText, currentFilter === 'high' && styles.activeTabText]}>High Risk</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.categoryTab, currentFilter === 'protected' && styles.activeTab]}
            onPress={() => setCurrentFilter('protected')}
          >
            <Text style={[styles.categoryTabText, currentFilter === 'protected' && styles.activeTabText]}>Protected</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.appsList}>
          {loading ? (
            <ActivityIndicator size="large" color="#4169E1" style={styles.loader} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : filteredApps.length === 0 ? (
            <Text style={styles.emptyText}>No apps found</Text>
          ) : (
            filteredApps.map((app, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.appCard}
                onPress={() => showAppDetails(app)}
              >
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{app.appName || 'Unknown App'}</Text>
                  <Text style={styles.packageName}>{app.packageName}</Text>
                  <View style={[styles.riskBadge, { backgroundColor: getRiskColor(app.risk) + '20' }]}>
                    <Text style={[styles.riskText, { color: getRiskColor(app.risk) }]}>
                      {(app.risk ? app.risk.charAt(0).toUpperCase() + app.risk.slice(1) : 'Unknown') + ' Risk'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.lockButton}
                  onPress={() => toggleAppLock(app)}
                >
                  {app.isLocked ? (
                    <Lock size={20} color="#4169E1" />
                  ) : (
                    <Unlock size={20} color="#888" />
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
        <View style={styles.advisorySection}>
          <View style={styles.advisoryHeader}>
            <AlertTriangle size={20} color="#ff6b6b" />
            <Text style={styles.advisoryTitle}>Security Advisory</Text>
          </View>
          <Text style={styles.advisoryText}>
            {(apps.filter(a => a.risk === 'high').length || 0) > 0 
              ? `You have ${apps.filter(a => a.risk === 'high').length} high-risk apps installed. Review their permissions and consider uninstalling or restricting them.`
              : 'Your device is currently secure. Keep reviewing app permissions regularly.'}
          </Text>
          <TouchableOpacity 
            style={styles.advisoryButton}
            onPress={() => setCurrentFilter('high')}
          >
            <Text style={styles.advisoryButtonText}>Review High-Risk Apps</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.featuresSection}>
          <Text style={styles.featuresSectionTitle}>App Protection Features</Text>
          <View style={styles.featuresGrid}>
            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => setCurrentFilter('protected')}
            >
              <View style={styles.featureIcon}>
                <Lock size={24} color="#4169E1" />
              </View>
              <Text style={styles.featureName}>App Lock</Text>
              <Text style={styles.featureDescription}>
                {apps.filter(a => a.isLocked).length} Apps Protected
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => setShowPermissionsModal(true)}
            >
              <View style={styles.featureIcon}>
                <Shield size={24} color="#4169E1" />
              </View>
              <Text style={styles.featureName}>Permissions</Text>
              <Text style={styles.featureDescription}>Manage app permissions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {renderPermissionsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginLeft: 8,
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  scanButton: {
    backgroundColor: '#4169E1',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginLeft: 8,
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#4169E1',
  },
  categoryTabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  appsList: {
    paddingHorizontal: 16,
  },
  appCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 6,
  },
  packageName: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  riskText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  lockButton: {
    padding: 8,
  },
  advisorySection: {
    backgroundColor: '#ffecec',
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  advisoryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ff6b6b',
    marginLeft: 8,
  },
  advisoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  advisoryButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  advisoryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ff6b6b',
  },
  featuresSection: {
    padding: 16,
    marginBottom: 32,
  },
  featuresSectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
    marginBottom: 16,
  },
  permissionsList: {
    maxHeight: 300,
  },
  permissionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  permissionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  modalCloseButton: {
    marginTop: 16,
    backgroundColor: '#4169E1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  riskSection: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  riskTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  threatsList: {
    marginTop: 8,
  },
  threatText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  recommendationsSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  lastScannedText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default AppsScreen;