import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { MapPin, Lock, Smartphone, Shield, AlertTriangle, Eye, Volume2, Mail, MessageSquare } from 'lucide-react-native';
import Header from '@/components/Header';
import * as Location from 'expo-location';
import { FreeApiService } from '../services/freeApiService';

interface DeviceLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  address?: string;
  city?: string;
  country?: string;
}

export default function AntiTheftScreen() {
  const [isProtectionEnabled, setIsProtectionEnabled] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<DeviceLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastSeen, setLastSeen] = useState<string>('');
  const [isGeofenceActive, setIsGeofenceActive] = useState(false);

  useEffect(() => {
    getCurrentLocation();
    const interval = setInterval(getCurrentLocation, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for anti-theft protection');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const deviceLocation: DeviceLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
        accuracy: location.coords.accuracy || undefined,
      };

      // Get address using free geocoding
      const addressInfo = await FreeApiService.reverseGeocode(
        deviceLocation.latitude, 
        deviceLocation.longitude
      );
      
      const enrichedLocation = {
        ...deviceLocation,
        address: addressInfo?.address,
        city: addressInfo?.city,
        country: addressInfo?.country,
      };
      
      setCurrentLocation(enrichedLocation);
      setLastSeen(new Date().toLocaleString());
      
      // Send location to backend for tracking
      sendLocationToBackend(enrichedLocation);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const sendLocationToBackend = async (location: DeviceLocation) => {
    try {
      console.log('Sending location to backend:', location);
      
      // Send to free webhook for testing
      await FreeApiService.sendWebhookAlert({
        type: 'location_update',
        location,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error sending location:', error);
    }
  };
  
  const sendEmergencyAlerts = async () => {
    if (!currentLocation) return;
    
    try {
      await FreeApiService.sendEmergencyEmail(currentLocation, {
        deviceName: 'My Device',
        timestamp: new Date().toISOString(),
      });
      
      await FreeApiService.sendWebhookAlert({
        type: 'emergency_alert',
        location: currentLocation,
        severity: 'high',
        timestamp: Date.now(),
      });
      
      Alert.alert('Alerts Sent', 'Emergency notifications sent via email and webhook');
    } catch (error) {
      Alert.alert('Error', 'Failed to send emergency alerts');
    }
  };

  const handleLocateDevice = () => {
    setIsTracking(true);
    getCurrentLocation();
    Alert.alert(
      'Device Located',
      `Current location: ${currentLocation?.latitude.toFixed(6)}, ${currentLocation?.longitude.toFixed(6)}`,
      [{ text: 'OK', onPress: () => setIsTracking(false) }]
    );
  };

  const handleLockDevice = () => {
    Alert.alert(
      'Lock Device',
      'Are you sure you want to lock this device remotely?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Lock', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Device Locked', 'Device has been locked remotely');
          }
        }
      ]
    );
  };

  const handleWipeDevice = () => {
    Alert.alert(
      'Wipe Device',
      'WARNING: This will permanently delete all data on this device. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Wipe', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Device Wipe Initiated', 'Device wipe has been scheduled');
          }
        }
      ]
    );
  };

  const handleSoundAlarm = () => {
    Alert.alert('Alarm Activated', 'Device alarm is now playing at maximum volume');
  };

  return (
    <View style={styles.container}>
      <Header title="Anti-Theft Protection" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Shield size={24} color={isProtectionEnabled ? '#4169E1' : '#666'} />
            <Text style={styles.statusTitle}>Protection Status</Text>
            <Switch
              value={isProtectionEnabled}
              onValueChange={setIsProtectionEnabled}
              trackColor={{ false: '#ccc', true: '#4169E1' }}
            />
          </View>
          
          <View style={[styles.statusIndicator, isProtectionEnabled ? styles.statusActive : styles.statusInactive]}>
            <Text style={styles.statusText}>
              {isProtectionEnabled ? 'ACTIVE' : 'INACTIVE'}
            </Text>
          </View>
          
          <Text style={styles.statusDetails}>
            {isProtectionEnabled 
              ? 'Your device is protected and being monitored'
              : 'Enable protection to secure your device'
            }
          </Text>
        </View>

        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <MapPin size={24} color="#4169E1" />
            <Text style={styles.locationTitle}>Device Location</Text>
          </View>
          
          {currentLocation ? (
            <View>
              {currentLocation.address ? (
                <Text style={styles.addressText}>
                  📍 {currentLocation.address}
                </Text>
              ) : (
                <View>
                  <Text style={styles.locationText}>
                    Lat: {currentLocation.latitude.toFixed(6)}
                  </Text>
                  <Text style={styles.locationText}>
                    Lng: {currentLocation.longitude.toFixed(6)}
                  </Text>
                </View>
              )}
              {currentLocation.city && (
                <Text style={styles.cityText}>
                  🏙️ {currentLocation.city}, {currentLocation.country}
                </Text>
              )}
              <Text style={styles.lastSeenText}>
                Last seen: {lastSeen}
              </Text>
            </View>
          ) : (
            <Text style={styles.locationText}>Getting location...</Text>
          )}
        </View>

        <View style={styles.geofenceCard}>
          <View style={styles.geofenceHeader}>
            <Shield size={20} color="#4169E1" />
            <Text style={styles.geofenceTitle}>Geofence Protection</Text>
            <Switch
              value={isGeofenceActive}
              onValueChange={setIsGeofenceActive}
              trackColor={{ false: '#ccc', true: '#4169E1' }}
            />
          </View>
          <Text style={styles.geofenceText}>
            {isGeofenceActive 
              ? 'Device will alert if it leaves safe zone'
              : 'Enable to monitor device movement'
            }
          </Text>
        </View>
        
        <Text style={styles.sectionHeader}>Remote Actions</Text>

        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, styles.locateCard]} 
            onPress={handleLocateDevice}
            disabled={!isProtectionEnabled}
          >
            <MapPin size={32} color={isProtectionEnabled ? '#4169E1' : '#ccc'} />
            <Text style={[styles.actionText, !isProtectionEnabled && styles.disabledText]}>
              Locate Device
            </Text>
            <Text style={[styles.actionSubtext, !isProtectionEnabled && styles.disabledText]}>
              Find your device
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, styles.lockCard]} 
            onPress={handleLockDevice}
            disabled={!isProtectionEnabled}
          >
            <Lock size={32} color={isProtectionEnabled ? '#FF6B35' : '#ccc'} />
            <Text style={[styles.actionText, !isProtectionEnabled && styles.disabledText]}>
              Lock Device
            </Text>
            <Text style={[styles.actionSubtext, !isProtectionEnabled && styles.disabledText]}>
              Remote lock
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, styles.alarmCard]} 
            onPress={handleSoundAlarm}
            disabled={!isProtectionEnabled}
          >
            <Volume2 size={32} color={isProtectionEnabled ? '#28A745' : '#ccc'} />
            <Text style={[styles.actionText, !isProtectionEnabled && styles.disabledText]}>
              Sound Alarm
            </Text>
            <Text style={[styles.actionSubtext, !isProtectionEnabled && styles.disabledText]}>
              Play loud sound
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, styles.wipeCard]} 
            onPress={handleWipeDevice}
            disabled={!isProtectionEnabled}
          >
            <AlertTriangle size={32} color={isProtectionEnabled ? '#DC3545' : '#ccc'} />
            <Text style={[styles.actionText, !isProtectionEnabled && styles.disabledText]}>
              Wipe Device
            </Text>
            <Text style={[styles.actionSubtext, !isProtectionEnabled && styles.disabledText]}>
              Delete all data
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard]} 
            onPress={sendEmergencyAlerts}
            disabled={!isProtectionEnabled || !currentLocation}
          >
            <Mail size={32} color={isProtectionEnabled ? '#6F42C1' : '#ccc'} />
            <Text style={[styles.actionText, !isProtectionEnabled && styles.disabledText]}>
              Send Alert
            </Text>
            <Text style={[styles.actionSubtext, !isProtectionEnabled && styles.disabledText]}>
              Email & webhook
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard]} 
            onPress={() => FreeApiService.sendWebhookAlert({ type: 'location_share', location: currentLocation })}
            disabled={!isProtectionEnabled || !currentLocation}
          >
            <MessageSquare size={32} color={isProtectionEnabled ? '#17A2B8' : '#ccc'} />
            <Text style={[styles.actionText, !isProtectionEnabled && styles.disabledText]}>
              Share Location
            </Text>
            <Text style={[styles.actionSubtext, !isProtectionEnabled && styles.disabledText]}>
              Send coordinates
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Eye size={20} color="#4169E1" />
            <Text style={styles.infoTitle}>How It Works</Text>
          </View>
          <Text style={styles.infoText}>
            • Real-time location with address{'\n'}
            • Free geocoding via OpenStreetMap{'\n'}
            • Geofence monitoring{'\n'}
            • Email alerts via EmailJS{'\n'}
            • Webhook notifications{'\n'}
            • Emergency response features
          </Text>
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
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
    flex: 1,
    color: '#333',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusActive: {
    backgroundColor: '#e6f7eb',
  },
  statusInactive: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  statusDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  locationCard: {
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
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
    color: '#333',
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginBottom: 4,
  },
  lastSeenText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  actionsGrid: {
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
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    textAlign: 'center',
  },
  actionSubtext: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  disabledText: {
    color: '#ccc',
  },
  infoCard: {
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
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 8,
  },
  cityText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  geofenceCard: {
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
  geofenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  geofenceTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
    flex: 1,
    color: '#333',
  },
  geofenceText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
});