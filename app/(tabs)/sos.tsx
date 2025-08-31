import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Header from '@/components/Header';
import SectionTitle from '@/components/SectionTitle';
import { TriangleAlert as AlertTriangle, Phone, User, Plus, Trash2 } from 'lucide-react-native';
import api from '@/services/api';
import { sendBulkSOSMessages, triggerSOS } from '@/services/twilioService';

// Mock data for development
const MOCK_CONTACTS = [
  { id: '1', name: 'Emergency Services', phone: '911' },
  { id: '2', name: 'Family Member', phone: '+1 234 567 8900' },
];

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
      // For development, use mock data
      setContacts(MOCK_CONTACTS);
      
      // Uncomment this when backend is ready
      // const userId = 'testuser';
      // const res = await api.http.get(`/api/sos/contacts?userId=${userId}`);
      // setContacts(res.data || []);
    } catch (err: any) {
      console.error('Error fetching contacts:', err);
      setError('Failed to fetch contacts. Using mock data for development.');
      setContacts(MOCK_CONTACTS); // Fallback to mock data
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

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      // For development, add to local state
      const newContact = {
        id: Date.now().toString(),
        name: contactName.trim(),
        phone: phoneNumber.trim(),
      };
      setContacts(prev => [...prev, newContact]);
      setContactName('');
      setPhoneNumber('');
      Alert.alert('Success', `Contact ${contactName} added successfully`);

      // Uncomment this when backend is ready
      // const userId = 'testuser';
      // await api.http.post('/api/sos/contacts', { userId, name: contactName, phone: phoneNumber });
      // fetchContacts();
    } catch (err: any) {
      console.error('Error adding contact:', err);
      Alert.alert('Error', 'Failed to add contact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = (contactId: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setContacts(prev => prev.filter(c => c.id !== contactId));
          },
        },
      ]
    );
  };

  const handleTriggerSOS = async () => {
    Alert.alert(
      'Trigger SOS',
      'Are you sure you want to trigger the SOS alert? This will send SMS and make calls to all your emergency contacts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Trigger SOS',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              if (contacts.length === 0) {
                Alert.alert('Error', 'Please add at least one emergency contact first.');
                return;
              }

              await triggerSOS(contacts);
              
              Alert.alert(
                'SOS Triggered',
                'Emergency contacts have been notified via SMS and phone calls.',
                [{ text: 'OK' }]
              );
            } catch (err: any) {
              console.error('Error triggering SOS:', err);
              Alert.alert(
                'Error',
                err.message || 'Failed to send SOS alerts. Please check your internet connection and try again.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      <Header title="Trinetra Security" />
      <SectionTitle title="SOS" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.sosSection}>
          <Text style={styles.sosTitle}>CyberHelps SOS</Text>
          
          <TouchableOpacity 
            style={[styles.triggerButton, loading && styles.triggerButtonDisabled]}
            onPress={handleTriggerSOS}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ff6b6b" />
            ) : (
              <Text style={styles.triggerText}>TRIGGER SOS</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <User size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contact Name"
                value={contactName}
                onChangeText={setContactName}
                editable={!loading}
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
                editable={!loading}
              />
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.addButton, loading && styles.addButtonDisabled]}
            onPress={handleAddContact}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#4169E1" />
            ) : (
              <Text style={styles.addButtonText}>ADD CONTACT</Text>
            )}
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
            <Text style={styles.errorText}>{error}</Text>
          ) : contacts.length === 0 ? (
            <Text style={styles.emptyText}>No emergency contacts added yet</Text>
          ) : (
            contacts.map((contact) => (
              <View key={contact.id} style={styles.contactItem}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteContact(contact.id)}
                >
                  <Trash2 size={20} color="#ff6b6b" />
                </TouchableOpacity>
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
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  triggerButtonDisabled: {
    backgroundColor: '#ffb3b3',
  },
  triggerText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
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
    backgroundColor: '#4169E1',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  addButtonDisabled: {
    backgroundColor: '#a0aec0',
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
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
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#ff6b6b',
    marginBottom: 8,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
});