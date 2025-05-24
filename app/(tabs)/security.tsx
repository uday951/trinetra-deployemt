import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Header from '@/components/Header';
import SectionTitle from '@/components/SectionTitle';
import { Shield, Lock, Wifi, Search, Zap, CircleCheck as CheckCircle2, Circle as XCircle } from 'lucide-react-native';
import { useFileScan, useDeviceInfo } from '@/hooks/useApi';
import api from '@/services/api';

export default function SecurityScreen() {
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const { execute: scanFile } = useFileScan();
  const { execute: getDeviceInfo } = useDeviceInfo();

  const handleScan = async () => {
    setScanLoading(true);
    setScanError(null);
    try {
      // For demo, just call getDeviceInfo as a placeholder
      const info = await getDeviceInfo();
      setScanResult({
        scanDetails: info,
        isMalicious: false,
        threats: [],
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      setScanError(err.message || 'Failed to scan');
    } finally {
      setScanLoading(false);
    }
  };

  const fetchActivity = async () => {
    setActivityLoading(true);
    setActivityError(null);
    try {
      // Replace with real API call if available
      const res = await api.http.get('/security/scan-history');
      setActivity(res.data || []);
    } catch (err: any) {
      setActivityError(err.message || 'Failed to fetch activity');
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Trinetra Security" />
      <SectionTitle title="Security" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Shield size={24} color="#4169E1" />
            <Text style={styles.statusTitle}>Security Status</Text>
          </View>
          
          <View style={styles.statusMeter}>
            <View style={styles.meterTrack}>
              <View style={[styles.meterFill, { width: '85%' }]} />
            </View>
            <Text style={styles.meterText}>85% Protected</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={handleScan}
            disabled={scanLoading}
          >
            <Search size={20} color="#fff" />
            <Text style={styles.scanButtonText}>
              {scanLoading ? 'Scanning...' : 'Run Security Scan'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {scanError && <Text style={{ color: 'red', margin: 8 }}>{scanError}</Text>}
        
        {scanResult && (
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Scan Results</Text>
            <Text style={styles.resultText}>{JSON.stringify(scanResult, null, 2)}</Text>
          </View>
        )}
        
        <Text style={styles.sectionHeader}>Protection Features</Text>
        
        <View style={styles.featureCard}>
          <View style={styles.featureHeader}>
            <View style={styles.featureIconContainer}>
              <Lock size={24} color="#4169E1" />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureName}>App Lock</Text>
              <Text style={styles.featureStatus}>Enabled</Text>
            </View>
          </View>
          <Text style={styles.featureDescription}>
            Protect sensitive apps with an additional layer of security.
          </Text>
          <TouchableOpacity style={styles.featureButton}>
            <Text style={styles.featureButtonText}>Configure</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.featureCard}>
          <View style={styles.featureHeader}>
            <View style={styles.featureIconContainer}>
              <Wifi size={24} color="#4169E1" />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureName}>Network Protection</Text>
              <Text style={styles.featureStatus}>Enabled</Text>
            </View>
          </View>
          <Text style={styles.featureDescription}>
            Monitor network traffic and protect against unsecure connections.
          </Text>
          <TouchableOpacity style={styles.featureButton}>
            <Text style={styles.featureButtonText}>Configure</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionHeader}>Recent Activity</Text>
        
        {activityLoading ? (
          <ActivityIndicator size="small" color="#4169E1" />
        ) : activityError ? (
          <Text style={{ color: 'red' }}>{activityError}</Text>
        ) : (
          <View style={styles.activityList}>
            {activity.map((item, idx) => (
              <View key={idx} style={styles.activityItem}>
                <Text style={styles.activityTitle}>{item.scanDetails?.fileName || 'Scan'}</Text>
                <Text style={styles.activityTime}>{item.timestamp}</Text>
              </View>
            ))}
          </View>
        )}
        
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All Activity</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
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
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 8,
  },
  statusMeter: {
    marginBottom: 16,
  },
  meterTrack: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    backgroundColor: '#4169E1',
    borderRadius: 4,
  },
  meterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    textAlign: 'right',
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
  resultsCard: {
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
  resultsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  resultText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginLeft: 12,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureInfo: {
    flex: 1,
  },
  featureName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  featureStatus: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#2e7d32',
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  featureButton: {
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  featureButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4169E1',
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888',
  },
  viewAllButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4169E1',
  },
});