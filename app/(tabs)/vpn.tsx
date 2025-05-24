import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import Header from '@/components/Header';
import SectionTitle from '@/components/SectionTitle';
import OpenVPN from 'react-native-openvpn';

const VPN_API_KEY = '3afd3d0d522949319a4a023c26d0940c';

export default function VPNScreen() {
  // vpnapi.io section
  const [ip, setIp] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OpenVPN section
  const [ovpnConfig, setOvpnConfig] = useState('');
  const [vpnStatus, setVpnStatus] = useState('disconnected');
  const [vpnError, setVpnError] = useState<string | null>(null);
  const [vpnLoading, setVpnLoading] = useState(false);

  const handleCheck = async () => {
    if (!ip.trim()) {
      Alert.alert('Error', 'Please enter an IP address');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(`https://vpnapi.io/api/${ip}?key=${VPN_API_KEY}`);
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to check IP');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectVPN = async () => {
    if (!ovpnConfig.trim()) {
      Alert.alert('Error', 'Please paste a valid .ovpn config');
      return;
    }
    setVpnLoading(true);
    setVpnError(null);
    setVpnStatus('connecting...');
    try {
      await OpenVPN.connect({
        config: ovpnConfig,
        // username: '', // If needed
        // password: '', // If needed
      });
      setVpnStatus('connected');
    } catch (e: any) {
      setVpnStatus('error');
      setVpnError(e.message || 'Failed to connect VPN');
    } finally {
      setVpnLoading(false);
    }
  };

  const handleDisconnectVPN = async () => {
    setVpnLoading(true);
    setVpnError(null);
    try {
      await OpenVPN.disconnect();
      setVpnStatus('disconnected');
    } catch (e: any) {
      setVpnError(e.message || 'Failed to disconnect VPN');
    } finally {
      setVpnLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Header title="VPN Features" />
      <ScrollView style={styles.scrollView}>
        {/* OpenVPN Section */}
        <SectionTitle title="OpenVPN Connect/Disconnect (Free)" />
        <View style={styles.vpnSection}>
          <Text style={styles.vpnStatus}>VPN Status: {vpnStatus}</Text>
          <TextInput
            style={styles.ovpnInput}
            placeholder="Paste .ovpn config here (get from VPN Gate or your server)"
            value={ovpnConfig}
            onChangeText={setOvpnConfig}
            multiline
            numberOfLines={6}
          />
          <View style={styles.vpnButtonRow}>
            <TouchableOpacity style={styles.vpnButton} onPress={handleConnectVPN} disabled={vpnLoading}>
              <Text style={styles.vpnButtonText}>{vpnLoading ? 'Connecting...' : 'Connect VPN'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.vpnButton} onPress={handleDisconnectVPN} disabled={vpnLoading}>
              <Text style={styles.vpnButtonText}>Disconnect VPN</Text>
            </TouchableOpacity>
          </View>
          {vpnError && <Text style={styles.errorText}>{vpnError}</Text>}
        </View>
        
        {/* Divider */}
        <View style={{ height: 32 }} />

        {/* vpnapi.io Section */}
        <SectionTitle title="VPN/Proxy/Tor Check (vpnapi.io)" />
        <View style={styles.inputSection}>
          <TextInput
            style={styles.input}
            placeholder="Enter IP address (e.g. 8.8.8.8)"
            value={ip}
            onChangeText={setIp}
            keyboardType="numeric"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.checkButton} onPress={handleCheck} disabled={loading}>
            <Text style={styles.checkButtonText}>{loading ? 'Checking...' : 'Check'}</Text>
          </TouchableOpacity>
          </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {result && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Result for {result.ip}</Text>
            <Text style={styles.resultLabel}>VPN: <Text style={{color: result.security?.vpn ? 'red' : 'green'}}>{result.security?.vpn ? 'Yes' : 'No'}</Text></Text>
            <Text style={styles.resultLabel}>Proxy: <Text style={{color: result.security?.proxy ? 'red' : 'green'}}>{result.security?.proxy ? 'Yes' : 'No'}</Text></Text>
            <Text style={styles.resultLabel}>Tor: <Text style={{color: result.security?.tor ? 'red' : 'green'}}>{result.security?.tor ? 'Yes' : 'No'}</Text></Text>
            <Text style={styles.resultLabel}>Relay: <Text style={{color: result.security?.relay ? 'red' : 'green'}}>{result.security?.relay ? 'Yes' : 'No'}</Text></Text>
            <Text style={styles.resultLabel}>Country: {result.location?.country || '-'}</Text>
            <Text style={styles.resultLabel}>City: {result.location?.city || '-'}</Text>
            <Text style={styles.resultLabel}>ISP: {result.network?.autonomous_system_organization || '-'}</Text>
          </View>
        )}
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
  vpnSection: {
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
  vpnStatus: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  ovpnInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    minHeight: 100,
    marginBottom: 12,
  },
  vpnButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  vpnButton: {
    backgroundColor: '#4169E1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  vpnButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
  inputSection: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  checkButton: {
    backgroundColor: '#4169E1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    margin: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  resultSection: {
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
  resultTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginBottom: 4,
  },
});