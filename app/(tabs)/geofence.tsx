import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import Header from '@/components/Header';
import SectionTitle from '@/components/SectionTitle';
import { MapPin, Plus, CircleAlert as AlertCircle, Settings } from 'lucide-react-native';

export default function GeoFenceScreen() {
  const [zones, setZones] = useState([
    { id: 1, name: 'Home', address: '123 Main Street, Anytown', radius: '200m', active: true },
    { id: 2, name: 'School', address: '456 Education Ave, Anytown', radius: '300m', active: true },
  ]);
  
  return (
    <View style={styles.container}>
      <Header title="Trinetra Security" />
      <SectionTitle title="GeoFence" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.mapContainer}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/6147363/pexels-photo-6147363.jpeg' }} 
            style={styles.mapImage}
            resizeMode="cover"
          />
          <View style={styles.mapOverlay}>
            <TouchableOpacity style={styles.addZoneButton}>
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.zonesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Safe Zones</Text>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Add Zone</Text>
            </TouchableOpacity>
          </View>
          
          {zones.map(zone => (
            <View key={zone.id} style={styles.zoneCard}>
              <View style={styles.zoneIconContainer}>
                <MapPin size={24} color="#4169E1" />
              </View>
              <View style={styles.zoneInfo}>
                <View style={styles.zoneHeader}>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <View style={[
                    styles.zoneStatus,
                    zone.active ? styles.zoneActive : styles.zoneInactive
                  ]}>
                    <Text style={[
                      styles.zoneStatusText,
                      zone.active ? styles.zoneActiveText : styles.zoneInactiveText
                    ]}>
                      {zone.active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.zoneAddress}>{zone.address}</Text>
                <Text style={styles.zoneRadius}>Radius: {zone.radius}</Text>
                <View style={styles.zoneActions}>
                  <TouchableOpacity style={styles.zoneAction}>
                    <Text style={styles.zoneActionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.zoneAction}>
                    <Text style={styles.zoneActionText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.alertsSection}>
          <Text style={styles.alertsSectionTitle}>Recent Alerts</Text>
          
          <View style={styles.alertCard}>
            <View style={styles.alertIconContainer}>
              <AlertCircle size={24} color="#ff6b6b" />
            </View>
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>Left School Zone</Text>
              <Text style={styles.alertTime}>Today, 3:15 PM</Text>
              <Text style={styles.alertDescription}>
                Device left the "School" safe zone outside scheduled hours.
              </Text>
            </View>
          </View>
          
          <View style={styles.alertCard}>
            <View style={styles.alertIconContainer}>
              <AlertCircle size={24} color="#ff6b6b" />
            </View>
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>Entered Unknown Area</Text>
              <Text style={styles.alertTime}>Yesterday, 5:42 PM</Text>
              <Text style={styles.alertDescription}>
                Device entered an area not defined in safe zones.
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Alerts</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingsSection}>
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Settings size={20} color="#4169E1" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>GeoFence Settings</Text>
              <Text style={styles.settingDescription}>
                Configure notification preferences, tracking frequency, and more.
              </Text>
            </View>
            <TouchableOpacity style={styles.settingButton}>
              <Text style={styles.settingButtonText}>Configure</Text>
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
  mapContainer: {
    height: 200,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 16,
  },
  addZoneButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4169E1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  zonesSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#f0f4ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4169E1',
  },
  zoneCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  zoneIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  zoneName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  zoneStatus: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  zoneActive: {
    backgroundColor: '#e6f7eb',
  },
  zoneInactive: {
    backgroundColor: '#f8d7da',
  },
  zoneStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  zoneActiveText: {
    color: '#2e7d32',
  },
  zoneInactiveText: {
    color: '#d32f2f',
  },
  zoneAddress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  zoneRadius: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 12,
  },
  zoneActions: {
    flexDirection: 'row',
  },
  zoneAction: {
    backgroundColor: '#f0f4ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  zoneActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4169E1',
  },
  alertsSection: {
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
  alertsSectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  alertCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffecec',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4169E1',
  },
  settingsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    lineHeight: 20,
  },
  settingButton: {
    backgroundColor: '#f0f4ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  settingButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4169E1',
  },
});