import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);

  const [autoLock, setAutoLock] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);



  const loadSettings = async () => {
    try {
      const biometricSetting = await AsyncStorage.getItem('biometric');
      if (biometricSetting) {
        setBiometric(JSON.parse(biometricSetting));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleChangePassword = () => {
    router.push('/change-password');
  };

  const handleLanguage = () => {
    router.push('/language');
  };

  const handleHelp = () => {
    router.push('/help');
  };

  const handleAbout = () => {
    router.push('/about');
  };

  const handleBiometricToggle = async (value: boolean) => {
    setBiometric(value);
    await saveSetting('biometric', value);
    Alert.alert('Success', value ? 'Biometric authentication enabled' : 'Biometric authentication disabled');
  };

  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
          <MaterialIcons name="lock-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Change Password</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <View style={styles.menuItem}>
          <MaterialIcons name="fingerprint" size={24} color="#333" />
          <Text style={styles.menuText}>Biometric Authentication</Text>
          <Switch
            value={biometric}
            onValueChange={handleBiometricToggle}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
          />
        </View>

        <View style={styles.menuItem}>
          <MaterialIcons name="lock-clock" size={24} color="#333" />
          <Text style={styles.menuText}>Auto Lock</Text>
          <Switch
            value={autoLock}
            onValueChange={(value) => {
              setAutoLock(value);
              saveSetting('autoLock', value);
            }}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.menuItem}>
          <MaterialIcons name="notifications" size={24} color="#333" />
          <Text style={styles.menuText}>Push Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={(value) => {
              setNotifications(value);
              saveSetting('notifications', value);
            }}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>

        <TouchableOpacity style={styles.menuItem} onPress={handleLanguage}>
          <MaterialIcons name="language" size={24} color="#333" />
          <Text style={styles.menuText}>Language</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
          <MaterialIcons name="help-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Help & Support</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
          <MaterialIcons name="info-outline" size={24} color="#333" />
          <Text style={styles.menuText}>About</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 16,
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },

});