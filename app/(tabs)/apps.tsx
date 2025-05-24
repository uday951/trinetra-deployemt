import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Platform } from 'react-native';
import Header from '@/components/Header';
import SectionTitle from '@/components/SectionTitle';
import { Search, Shield, TriangleAlert as AlertTriangle, Lock } from 'lucide-react-native';
import api from '@/services/api';
// @ts-ignore
import InstalledApps from 'react-native-installed-apps';

let canUseInstalledApps = true;
try {
  if (!InstalledApps || typeof InstalledApps.getApps !== 'function') {
    canUseInstalledApps = false;
  }
} catch (e) {
  canUseInstalledApps = false;
}

export default function AppsScreen() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      setError(null);
      try {
        if (Platform.OS === 'android' && canUseInstalledApps) {
          const installed = await InstalledApps.getApps();
          setApps(installed);
        } else if (Platform.OS === 'android' && !canUseInstalledApps) {
          setError('InstalledApps native module is not available. This feature requires a custom dev client or bare React Native app.');
        } else {
          const data = await api.appsApi.getInstalledApps();
          setApps(data.apps || []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch apps');
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const handleScanThreats = async () => {
    setScanLoading(true);
    setScanError(null);
    try {
      if (Platform.OS === 'android' && canUseInstalledApps) {
        const installed = await InstalledApps.getApps();
        setApps(installed);
      } else if (Platform.OS === 'android' && !canUseInstalledApps) {
        setScanError('InstalledApps native module is not available. This feature requires a custom dev client or bare React Native app.');
      } else {
        const data = await api.appsApi.scanThreats();
        setApps(data.apps || []);
      }
    } catch (err: any) {
      setScanError(err.message || 'Failed to scan for threats');
    } finally {
      setScanLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffa94d';
      case 'low': return '#2e7d32';
      default: return '#888';
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Trinetra Security" />
      <SectionTitle title="Apps" />
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#888" />
          <Text style={styles.searchPlaceholder}>Search apps...</Text>
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
              <Text style={styles.summaryValue}>-</Text>
              <Text style={styles.summaryLabel}>High Risk</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>-</Text>
              <Text style={styles.summaryLabel}>Medium Risk</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.scanButton} onPress={handleScanThreats} disabled={scanLoading}>
            <Shield size={16} color="#fff" />
            <Text style={styles.scanButtonText}>{scanLoading ? 'Scanning...' : 'Scan for Threats'}</Text>
          </TouchableOpacity>
          {scanError && <Text style={{ color: 'red', marginTop: 8 }}>{scanError}</Text>}
        </View>
        <View style={styles.categoryTabs}>
          <TouchableOpacity style={[styles.categoryTab, styles.activeTab]}>
            <Text style={[styles.categoryTabText, styles.activeTabText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTab}>
            <Text style={styles.categoryTabText}>High Risk</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTab}>
            <Text style={styles.categoryTabText}>Protected</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.appsList}>
          {loading ? (
            <ActivityIndicator size="large" color="#4169E1" />
          ) : error ? (
            <Text style={{ color: 'red', margin: 16 }}>{error}</Text>
          ) : apps.length === 0 ? (
            <Text style={{ color: '#888', margin: 16 }}>No apps found.</Text>
          ) : (
            apps.map((app, idx) => (
              <TouchableOpacity key={idx} style={styles.appCard}>
                <Image 
                  source={{ uri: app.icon || 'https://images.pexels.com/photos/35550/ipad-tablet-technology-touch.jpg' }} 
                  style={styles.appIcon} 
                />
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{app.appName || app.name}</Text>
                  <View style={styles.appMeta}>
                    <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(app.risk || 'medium')}20` }]}> 
                      <Text style={[styles.riskText, { color: getRiskColor(app.risk || 'medium') }]}>{app.risk ? `${app.risk.charAt(0).toUpperCase() + app.risk.slice(1)} Risk` : 'Medium Risk'}</Text>
                    </View>
                    <Text style={styles.permissionCount}>{app.permissions !== undefined ? `${app.permissions} Permissions` : (app.version ? `v${app.version}` : (app.versionName ? `v${app.versionName}` : ''))}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.protectButton}>
                  <Lock size={20} color="#4169E1" />
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
            Review your installed apps and their permissions regularly for better security.
          </Text>
          <TouchableOpacity style={styles.advisoryButton}>
            <Text style={styles.advisoryButtonText}>Review Apps</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.featuresSection}>
          <Text style={styles.featuresSectionTitle}>App Protection Features</Text>
          <View style={styles.featuresGrid}>
            <TouchableOpacity style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Lock size={24} color="#4169E1" />
              </View>
              <Text style={styles.featureName}>App Lock</Text>
              <Text style={styles.featureDescription}>Protect sensitive apps with a PIN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Shield size={24} color="#4169E1" />
              </View>
              <Text style={styles.featureName}>Permissions</Text>
              <Text style={styles.featureDescription}>Manage app permissions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  searchPlaceholder: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#888',
    marginLeft: 8,
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
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 16,
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
  appMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  riskText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  permissionCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888',
  },
  protectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
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
});