import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Phone, Shield, AlertTriangle } from 'lucide-react-native';
import callSimulator from '../services/callSimulator';

export default function CallTestPanel() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Test Call Detection</Text>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.testButton, styles.spamButton]}
          onPress={() => callSimulator.testSpamScenario()}
        >
          <AlertTriangle size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Spam Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.testButton, styles.safeButton]}
          onPress={() => callSimulator.testLegitimateScenario()}
        >
          <Shield size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Safe Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.testButton, styles.randomButton]}
          onPress={() => callSimulator.simulateIncomingCall()}
        >
          <Phone size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Random</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.subtitle}>
        Tap any button to simulate an incoming call with real NumVerify API check
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  testButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  spamButton: {
    backgroundColor: '#EF4444',
  },
  safeButton: {
    backgroundColor: '#10B981',
  },
  randomButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});