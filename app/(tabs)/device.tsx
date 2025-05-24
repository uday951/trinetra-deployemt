import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Header from '@/components/Header';
import SectionTitle from '@/components/SectionTitle';
import { 
  Smartphone, 
  Battery, 
  HardDrive, 
  Cpu, 
  Trash2, 
  Zap,
  Settings
} from 'lucide-react-native';

export default function DeviceScreen() {
  return (
    <View style={styles.container}>
      <Header title="Trinetra Security" />
      <SectionTitle title="Device" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.deviceInfoCard}>
          <View style={styles.deviceIconContainer}>
            <Smartphone size={32} color="#4169E1" />
          </View>
          
          <Text style={styles.deviceName}>{Platform.OS === 'ios' ? 'iPhone' : 'Android'} Device</Text>
          <Text style={styles.deviceModel}>Model: {Platform.OS === 'ios' ? 'iPhone 13 Pro' : 'Pixel 6'}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Battery size={20} color="#4169E1" />
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Battery</Text>
            </View>
            
            <View style={styles.statItem}>
              <HardDrive size={20} color="#4169E1" />
              <Text style={styles.statValue}>45%</Text>
              <Text style={styles.statLabel}>Storage</Text>
            </View>
            
            <View style={styles.statItem}>
              <Cpu size={20} color="#4169E1" />
              <Text style={styles.statValue}>32%</Text>
              <Text style={styles.statLabel}>CPU</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.optimizeCard}>
          <View style={styles.optimizeHeader}>
            <Text style={styles.optimizeTitle}>Device Optimization</Text>
            <Text style={styles.optimizeSubtitle}>Improve performance and battery life</Text>
          </View>
          
          <TouchableOpacity style={styles.optimizeButton}>
            <Zap size={20} color="#fff" />
            <Text style={styles.optimizeButtonText}>Optimize Now</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionHeader}>Maintenance Tools</Text>
        
        <View style={styles.toolsGrid}>
          <TouchableOpacity style={styles.toolCard}>
            <View style={styles.toolIcon}>
              <Trash2 size={24} color="#4169E1" />
            </View>
            <Text style={styles.toolName}>Cache Cleaner</Text>
            <Text style={styles.toolDescription}>Free up to 1.2 GB</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolCard}>
            <View style={styles.toolIcon}>
              <Battery size={24} color="#4169E1" />
            </View>
            <Text style={styles.toolName}>Battery Saver</Text>
            <Text style={styles.toolDescription}>Extend battery life</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolCard}>
            <View style={styles.toolIcon}>
              <HardDrive size={24} color="#4169E1" />
            </View>
            <Text style={styles.toolName}>Storage Analyzer</Text>
            <Text style={styles.toolDescription}>Find large files</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolCard}>
            <View style={styles.toolIcon}>
              <Cpu size={24} color="#4169E1" />
            </View>
            <Text style={styles.toolName}>Memory Booster</Text>
            <Text style={styles.toolDescription}>Improve performance</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.securityCard}>
          <Text style={styles.securityTitle}>Security Status</Text>
          
          <View style={styles.securityItem}>
            <View style={styles.securityStatus}>
              <View style={[styles.statusDot, styles.statusGood]} />
              <Text style={styles.securityStatusText}>System up to date</Text>
            </View>
            <TouchableOpacity style={styles.securityButton}>
              <Text style={styles.securityButtonText}>Check</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.securityItem}>
            <View style={styles.securityStatus}>
              <View style={[styles.statusDot, styles.statusGood]} />
              <Text style={styles.securityStatusText}>Encryption enabled</Text>
            </View>
            <TouchableOpacity style={styles.securityButton}>
              <Text style={styles.securityButtonText}>Details</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.securityItem}>
            <View style={styles.securityStatus}>
              <View style={[styles.statusDot, styles.statusWarning]} />
              <Text style={styles.securityStatusText}>Screen lock: Simple PIN</Text>
            </View>
            <TouchableOpacity style={styles.securityButton}>
              <Text style={styles.securityButtonText}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={20} color="#4169E1" />
          <Text style={styles.settingsButtonText}>Device Settings</Text>
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
  deviceInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceName: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  deviceModel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  optimizeCard: {
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
  optimizeHeader: {
    marginBottom: 16,
  },
  optimizeTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  optimizeSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  optimizeButton: {
    backgroundColor: '#4169E1',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optimizeButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginLeft: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  toolCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginRight: '4%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toolCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  toolCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  securityCard: {
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
  securityTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  securityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusGood: {
    backgroundColor: '#2e7d32',
  },
  statusWarning: {
    backgroundColor: '#ffa94d',
  },
  securityStatusText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  securityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
  },
  securityButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4169E1',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 32,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
  },
  settingsButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#4169E1',
    marginLeft: 8,
  },
});