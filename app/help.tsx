import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HelpScreen() {
  const router = useRouter();

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@trinetra.com?subject=Trinetra Support Request');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+1234567890');
  };

  const handleWebsite = () => {
    Linking.openURL('https://trinetra.com');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleContactSupport}>
          <MaterialIcons name="email" size={24} color="#333" />
          <View style={styles.textContainer}>
            <Text style={styles.menuText}>Email Support</Text>
            <Text style={styles.subText}>support@trinetra.com</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleCallSupport}>
          <MaterialIcons name="phone" size={24} color="#333" />
          <View style={styles.textContainer}>
            <Text style={styles.menuText}>Phone Support</Text>
            <Text style={styles.subText}>+1 (234) 567-890</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleWebsite}>
          <MaterialIcons name="web" size={24} color="#333" />
          <View style={styles.textContainer}>
            <Text style={styles.menuText}>Website</Text>
            <Text style={styles.subText}>trinetra.com</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FAQ</Text>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I enable biometric authentication?</Text>
          <Text style={styles.faqAnswer}>Go to Settings > Security > Biometric Authentication and toggle it on.</Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I change my password?</Text>
          <Text style={styles.faqAnswer}>Go to Settings > Security > Change Password and follow the instructions.</Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I enable notifications?</Text>
          <Text style={styles.faqAnswer}>Go to Settings > Notifications and toggle on the notifications you want to receive.</Text>
        </View>
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
    marginTop: 16,
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
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  faqItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});