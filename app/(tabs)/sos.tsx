import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Header from '@/components/Header';
import SectionTitle from '@/components/SectionTitle';
import { TriangleAlert as AlertTriangle, Phone, User, Plus } from 'lucide-react-native';
import api from '@/services/api';

export default function SOSScreen() {
  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.http.get('/sos/contacts');
      setContacts(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddContact = async () => {
    if (!contactName.trim() || !phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter both contact name and phone number');
      return;
    }
    setLoading(true);
    try {
      await api.http.post('/sos/contacts', { name: contactName, phone: phoneNumber });
      setContactName('');
      setPhoneNumber('');
      fetchContacts();
      Alert.alert('Success', `Contact ${contactName} added successfully`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSOS = async () => {
    setLoading(true);
    try {
      await api.http.post('/sos/trigger', { message: 'SOS Triggered from app' });
      Alert.alert('SOS Triggered', 'Emergency contacts have been notified of your situation.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to trigger SOS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Trinetra Security" />
      <SectionTitle title="SOS" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.sosSection}>
          <Text style={styles.sosTitle}>CyberHelps SOS</Text>
          
          <TouchableOpacity 
            style={styles.triggerButton}
            onPress={handleTriggerSOS}
            disabled={loading}
          >
            <Text style={styles.triggerText}>{loading ? 'Triggering...' : 'TRIGGER SOS'}</Text>
          </TouchableOpacity>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <User size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contact Name"
                value={contactName}
                onChangeText={setContactName}
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Phone size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddContact}
            disabled={loading}
          >
            <Text style={styles.addButtonText}>{loading ? 'Adding...' : 'ADD CONTACT'}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <AlertTriangle size={24} color="#ff6b6b" />
            <Text style={styles.infoTitle}>How SOS Works</Text>
          </View>
          
          <Text style={styles.infoText}>
            The SOS feature allows you to quickly notify your emergency contacts in case of an emergency situation. When triggered, the system will:
          </Text>
          
          <View style={styles.infoPoint}>
            <View style={styles.pointDot} />
            <Text style={styles.pointText}>Send your current location to your emergency contacts</Text>
          </View>
          
          <View style={styles.infoPoint}>
            <View style={styles.pointDot} />
            <Text style={styles.pointText}>Send a pre-defined emergency message</Text>
          </View>
          
          <View style={styles.infoPoint}>
            <View style={styles.pointDot} />
            <Text style={styles.pointText}>Automatically record audio for 30 seconds (if enabled)</Text>
          </View>
          
          <View style={styles.infoPoint}>
            <View style={styles.pointDot} />
            <Text style={styles.pointText}>Take a photo using the front camera (if enabled)</Text>
          </View>
        </View>
        
        <View style={styles.contactsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <TouchableOpacity style={styles.addIcon}>
              <Plus size={20} color="#4169E1" />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator size="small" color="#4169E1" />
          ) : error ? (
            <Text style={{ color: 'red' }}>{error}</Text>
          ) : contacts.length === 0 ? (
            <Text style={styles.emptyText}>No emergency contacts added yet</Text>
          ) : (
            contacts.map((c, idx) => (
              <View key={idx} style={styles.contactItem}>
                <Text style={styles.contactName}>{c.name}</Text>
                <Text style={styles.contactPhone}>{c.phone}</Text>
              </View>
            ))
          )}
        </View>
        
        <View style={styles.customizeSection}>
          <Text style={styles.customizeTitle}>Customize SOS Settings</Text>
          
          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Emergency Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Audio Recording</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Camera Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Activation Method</Text>
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
  sosSection: {
    padding: 16,
  },
  sosTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#4169E1',
    textAlign: 'center',
    marginBottom: 24,
  },
  triggerButton: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  triggerText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#888',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#888',
  },
  infoSection: {
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
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4169E1',
    marginTop: 7,
    marginRight: 8,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  contactsSection: {
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
  addIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#888',
    marginBottom: 4,
  },
  customizeSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 32,
  },
  customizeTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  settingButton: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#4169E1',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  contactPhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
});