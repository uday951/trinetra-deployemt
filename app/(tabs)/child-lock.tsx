import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import Header from '@/components/Header';
import SectionTitle from '@/components/SectionTitle';
import { Lock, Clock, Calendar, TriangleAlert as AlertTriangle } from 'lucide-react-native';

export default function ChildLockScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View style={styles.container}>
      <Header title="Trinetra Security" />
      <SectionTitle title="Child Lock" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Child Lock & Safe Apps</Text>
          
          <TouchableOpacity style={styles.lockButton}>
            <Lock size={20} color="#fff" />
            <Text style={styles.lockButtonText}>Lock Device</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Control</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Block Adult Content</Text>
              <Text style={styles.settingDescription}>Restrict access to adult websites and content</Text>
            </View>
            <Switch
              trackColor={{ false: "#ddd", true: "#bbd6ff" }}
              thumbColor={isEnabled ? "#4169E1" : "#f4f3f4"}
              ios_backgroundColor="#ddd"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>App Restrictions</Text>
              <Text style={styles.settingDescription}>Limit access to certain applications</Text>
            </View>
            <Switch
              trackColor={{ false: "#ddd", true: "#bbd6ff" }}
              thumbColor={isEnabled ? "#4169E1" : "#f4f3f4"}
              ios_backgroundColor="#ddd"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Management</Text>
          
          <View style={styles.timeManagementItem}>
            <View style={styles.timeIcon}>
              <Clock size={24} color="#4169E1" />
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.timeTitle}>Screen Time Limits</Text>
              <Text style={styles.timeDescription}>Set daily limits for device usage</Text>
              <TouchableOpacity style={styles.configureButton}>
                <Text style={styles.configureText}>Configure</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.timeManagementItem}>
            <View style={styles.timeIcon}>
              <Calendar size={24} color="#4169E1" />
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.timeTitle}>Schedule</Text>
              <Text style={styles.timeDescription}>Set allowed usage times and days</Text>
              <TouchableOpacity style={styles.configureButton}>
                <Text style={styles.configureText}>Configure</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safe Apps</Text>
          
          <View style={styles.appCard}>
            <View style={styles.appHeader}>
              <Text style={styles.appTitle}>Educational Apps</Text>
              <Text style={styles.appCount}>12 Apps</Text>
            </View>
            <Text style={styles.appDescription}>
              Curated list of educational applications suitable for children
            </Text>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View Apps</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.appCard}>
            <View style={styles.appHeader}>
              <Text style={styles.appTitle}>Entertainment Apps</Text>
              <Text style={styles.appCount}>8 Apps</Text>
            </View>
            <Text style={styles.appDescription}>
              Age-appropriate entertainment applications
            </Text>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View Apps</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.emergencySection}>
          <View style={styles.emergencyIcon}>
            <AlertTriangle size={24} color="#ff6b6b" />
          </View>
          <View style={styles.emergencyInfo}>
            <Text style={styles.emergencyTitle}>Emergency Override</Text>
            <Text style={styles.emergencyDescription}>
              In case of emergency, parents can temporarily disable restrictions
            </Text>
            <TouchableOpacity style={styles.emergencyButton}>
              <Text style={styles.emergencyButtonText}>Emergency Settings</Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  lockButton: {
    backgroundColor: '#ff6b6b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  lockButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  timeManagementItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  timeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timeInfo: {
    flex: 1,
  },
  timeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 4,
  },
  timeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 12,
  },
  configureButton: {
    backgroundColor: '#f0f4ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  configureText: {
    color: '#4169E1',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  appCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  appCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 12,
  },
  viewButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4169E1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewButtonText: {
    color: '#4169E1',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  emergencySection: {
    backgroundColor: '#fff8f8',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    marginBottom: 32,
  },
  emergencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffecec',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ff6b6b',
    marginBottom: 4,
  },
  emergencyDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 12,
  },
  emergencyButton: {
    backgroundColor: '#ffecec',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  emergencyButtonText: {
    color: '#ff6b6b',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});