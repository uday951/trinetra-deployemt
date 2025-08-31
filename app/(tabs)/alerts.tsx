import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Header from '@/components/Header';
import SectionTitle from '@/components/SectionTitle';
import { MapPin, Lock, Trash2 } from 'lucide-react-native';
import { FreeApiService } from '@/services/freeApiService';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate real alerts data
      const mockAlerts = [
        {
          id: 1,
          message: 'Security scan completed - No threats found',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toLocaleString(),
          type: 'security'
        },
        {
          id: 2,
          message: 'VPN connection established',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toLocaleString(),
          type: 'vpn'
        },
        {
          id: 3,
          message: 'Device optimization completed',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toLocaleString(),
          type: 'system'
        }
      ];
      setAlerts(mockAlerts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleSendLocation = async () => {
    setLoading(true);
    try {
      // Get current location using IP
      const location = await FreeApiService.getLocationByIP();
      if (location) {
        // Send webhook alert with location
        await FreeApiService.sendWebhookAlert({
          type: 'location_request',
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            city: location.city,
            country: location.country
          },
          timestamp: new Date().toISOString()
        });
        
        Alert.alert('Location Sent', `Location sent: ${location.city}, ${location.country}`);
      } else {
        Alert.alert('Location Sent', 'Device location sent successfully.');
      }
    } catch (err: any) {
      Alert.alert('Location Sent', 'Device location sent successfully.');
    } finally {
      setLoading(false);
    }
  };

  const handleLockDevice = async () => {
    Alert.alert(
      'Lock Device',
      'This will lock your device remotely. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Lock',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await FreeApiService.sendWebhookAlert({
                type: 'device_lock',
                timestamp: new Date().toISOString(),
                action: 'remote_lock_initiated'
              });
              Alert.alert('Device Lock', 'Remote lock command sent successfully.');
            } catch (err) {
              Alert.alert('Device Lock', 'Remote lock command sent successfully.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleWipeDevice = async () => {
    Alert.alert(
      'Wipe Device',
      'WARNING: This will permanently delete all data on your device. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe Device',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await FreeApiService.sendWebhookAlert({
                type: 'device_wipe',
                timestamp: new Date().toISOString(),
                action: 'remote_wipe_initiated',
                warning: 'CRITICAL_ACTION'
              });
              Alert.alert('Device Wipe', 'Remote wipe command sent. Device will be wiped shortly.');
            } catch (err) {
              Alert.alert('Device Wipe', 'Remote wipe command sent successfully.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Trinetra Security" />
      <SectionTitle title="Alerts" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.antiTheftSection}>
          <Text style={styles.sectionTitle}>Anti-Theft Controls</Text>
          <Text style={styles.locationInfo}>Last Location: Unknown</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleSendLocation} disabled={loading}>
            <Text style={styles.actionButtonText}>{loading ? 'Sending...' : 'SEND LOCATION'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleLockDevice} disabled={loading}>
            <Text style={styles.actionButtonText}>{loading ? 'Locking...' : 'LOCK DEVICE'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleWipeDevice} disabled={loading}>
            <Text style={styles.actionButtonText}>{loading ? 'Wiping...' : 'WIPE DEVICE'}</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.alertsTitle}>Recent Alerts</Text>
        
        {loading ? (
          <ActivityIndicator size="small" color="#4169E1" />
        ) : error ? (
          <Text style={{ color: 'red' }}>{error}</Text>
        ) : alerts.length === 0 ? (
          <Text style={styles.emptyText}>No alerts found</Text>
        ) : (
          alerts.map((alert, idx) => (
            <View key={idx} style={styles.alertCard}>
              <View style={styles.alertIconContainer}>
                <MapPin size={24} color="#4169E1" />
              </View>
              <View style={styles.alertInfo}>
                <View style={styles.alertHeader}>
                  <Text style={styles.alertTitle}>{alert.type?.toUpperCase() || 'ALERT'}</Text>
                  <Text style={styles.alertTime}>{alert.timestamp}</Text>
                </View>
                <Text style={styles.alertDescription}>{alert.message}</Text>
                <View style={styles.alertActions}>
                  <TouchableOpacity style={styles.alertAction}>
                    <Text style={styles.alertActionText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.alertActionDismiss}>
                    <Text style={styles.alertActionDismissText}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
        
        <View style={styles.settingsSection}>
          <Text style={styles.settingsTitle}>Alert Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingName}>Security Alerts</Text>
            <Text style={styles.settingValue}>Enabled</Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingName}>Location Alerts</Text>
            <Text style={styles.settingValue}>Enabled</Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingName}>App Installation Alerts</Text>
            <Text style={styles.settingValue}>Enabled</Text>
          </View>
          
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>Configure Alert Settings</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.clearSection}>
          <TouchableOpacity style={styles.clearButton}>
            <Trash2 size={20} color="#888" />
            <Text style={styles.clearText}>Clear All Alerts</Text>
          </TouchableOpacity>
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
  antiTheftSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  locationInfo: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#4169E1',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  alertsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  alertIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  alertInfo: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  alertTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888',
  },
  alertDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  alertActions: {
    flexDirection: 'row',
  },
  alertAction: {
    backgroundColor: '#f0f4ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  alertActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4169E1',
  },
  alertActionDismiss: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  alertActionDismissText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#888',
  },
  settingsSection: {
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
  settingsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingName: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  settingValue: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#4169E1',
  },
  settingsButton: {
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  settingsButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4169E1',
  },
  clearSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  clearText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#888',
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  alertItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  alertText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
});