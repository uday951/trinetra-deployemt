import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Header from '@/components/Header';
import SectionTitle from '@/components/SectionTitle';
import { Shield, Bell, CircleAlert as AlertCircle, Smartphone } from 'lucide-react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [securityStatus, setSecurityStatus] = useState('Protected');
  const [lastScanTime, setLastScanTime] = useState(new Date());
  const [protectionActive, setProtectionActive] = useState(true);

  useEffect(() => {
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Update security status every 30 seconds
    const securityInterval = setInterval(() => {
      updateSecurityStatus();
    }, 30000);

    // Initial security check
    updateSecurityStatus();

    return () => {
      clearInterval(timeInterval);
      clearInterval(securityInterval);
    };
  }, []);

  const updateSecurityStatus = async () => {
    try {
      // Simulate real-time security check
      const isProtected = Math.random() > 0.1; // 90% chance protected
      setSecurityStatus(isProtected ? 'Protected' : 'At Risk');
      setProtectionActive(isProtected);
      
      if (Math.random() > 0.7) { // 30% chance to update scan time
        setLastScanTime(new Date());
      }
    } catch (error) {
      console.error('Security status update failed:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return `Today at ${formatTime(date)}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };
  return (
    <View style={styles.container}>
      <Header title="Trinetra Security" />
      <SectionTitle title="Dashboard" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.securitySummary}>
          <View style={styles.securityHeader}>
            <Shield size={24} color="#4169E1" />
            <Text style={styles.securityTitle}>Security Status</Text>
          </View>
          
          <View style={styles.securityStatus}>
            <View style={[
              styles.statusIndicator, 
              protectionActive ? styles.statusGood : styles.statusRisk
            ]}>
              <Text style={[
                styles.statusText,
                { color: protectionActive ? '#2e7d32' : '#d32f2f' }
              ]}>
                {securityStatus}
              </Text>
            </View>
          </View>
          
          <Text style={styles.securityDetails}>
            Your device is currently {securityStatus.toLowerCase()}. Last scan: {formatDate(lastScanTime)}
          </Text>
          
          <Text style={styles.liveTime}>
            Live Status • {formatTime(currentTime)}
          </Text>
        </View>
        
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/security')}>
            <Shield size={32} color="#4169E1" />
            <Text style={styles.actionText}>Security Scan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/alerts')}>
            <Bell size={32} color="#4169E1" />
            <Text style={styles.actionText}>Alerts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/sos')}>
            <AlertCircle size={32} color="#4169E1" />
            <Text style={styles.actionText}>SOS</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/device')}>
            <Smartphone size={32} color="#4169E1" />
            <Text style={styles.actionText}>Device Info</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionHeader}>Device Protection</Text>
        
        <View style={styles.protectionCard}>
          <View style={styles.protectionHeader}>
            <Smartphone size={24} color="#4169E1" />
            <Text style={styles.protectionTitle}>Anti-Theft Protection</Text>
          </View>
          
          <Text style={styles.protectionDetails}>
            Locate, lock, or wipe your device remotely in case of theft.
          </Text>
          
          <TouchableOpacity style={styles.protectionButton} onPress={() => router.push('/anti-theft')}>
            <Text style={styles.buttonText}>Configure</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionHeader}>Latest Security News</Text>
        
        <View style={styles.newsCard}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg' }} 
            style={styles.newsImage} 
          />
          <View style={styles.newsContent}>
            <Text style={styles.newsTitle}>Stay Safe Online: Latest Phishing Scams</Text>
            <Text style={styles.newsDate}>May 15, 2025</Text>
            <Text style={styles.newsExcerpt}>
              Learn about the latest phishing techniques and how to protect yourself from online scams.
            </Text>
          </View>
        </View>
        
        <View style={styles.newsCard}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/6804073/pexels-photo-6804073.jpeg' }} 
            style={styles.newsImage} 
          />
          <View style={styles.newsContent}>
            <Text style={styles.newsTitle}>Child Safety Online: A Parent's Guide</Text>
            <Text style={styles.newsDate}>May 10, 2025</Text>
            <Text style={styles.newsExcerpt}>
              Essential tips for parents to ensure their children stay safe while using the internet.
            </Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Trinetra Security v1.0.0</Text>
          <Text style={styles.footerSubtext}>Protecting your digital life</Text>
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
  scrollView: {
    flex: 1,
  },
  securitySummary: {
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
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
    color: '#333',
  },
  securityStatus: {
    marginBottom: 12,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusGood: {
    backgroundColor: '#e6f7eb',
  },
  statusRisk: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2e7d32',
  },
  securityDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  liveTime: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4169E1',
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  protectionCard: {
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
  protectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  protectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
    color: '#333',
  },
  protectionDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  protectionButton: {
    backgroundColor: '#4169E1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  newsImage: {
    width: '100%',
    height: 150,
  },
  newsContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  newsDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888',
    marginBottom: 8,
  },
  newsExcerpt: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#888',
  },
  footerSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#aaa',
    marginTop: 4,
  },
});