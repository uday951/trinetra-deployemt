import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Header from '@/components/Header';
import SectionTitle from '@/components/SectionTitle';
import { Shield, Lock, Bell, CircleAlert as AlertCircle, Smartphone } from 'lucide-react-native';

export default function HomeScreen() {
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
            <View style={[styles.statusIndicator, styles.statusGood]}>
              <Text style={styles.statusText}>Protected</Text>
            </View>
          </View>
          
          <Text style={styles.securityDetails}>
            Your device is currently protected. Last scan: Today at 08:15 AM
          </Text>
        </View>
        
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard}>
            <Shield size={32} color="#4169E1" />
            <Text style={styles.actionText}>Scan Device</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <Lock size={32} color="#4169E1" />
            <Text style={styles.actionText}>Child Lock</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <Bell size={32} color="#4169E1" />
            <Text style={styles.actionText}>Alerts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <AlertCircle size={32} color="#4169E1" />
            <Text style={styles.actionText}>SOS</Text>
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
          
          <TouchableOpacity style={styles.protectionButton}>
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