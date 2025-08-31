import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

export default function ConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [serverUrl, setServerUrl] = useState<string>('');

  const testUrls = [
    'http://localhost:5000',
    'http://10.0.2.2:5000',
    'http://192.168.1.5:5000'
  ];

  const testConnection = async () => {
    setConnectionStatus('Testing connections...');
    
    for (const url of testUrls) {
      try {
        console.log(`Testing: ${url}`);
        const response = await axios.get(`${url}/health`, { timeout: 3000 });
        
        if (response.status === 200) {
          setConnectionStatus(`✅ Connected to: ${url}`);
          setServerUrl(url);
          return;
        }
      } catch (error) {
        console.log(`❌ Failed: ${url}`);
      }
    }
    
    setConnectionStatus('❌ No connection found');
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Connection Test</Text>
      <Text style={styles.status}>{connectionStatus}</Text>
      {serverUrl && (
        <Text style={styles.url}>Using: {serverUrl}</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={testConnection}>
        <Text style={styles.buttonText}>Test Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1F2937',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 10,
  },
  url: {
    color: '#10B981',
    fontSize: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});