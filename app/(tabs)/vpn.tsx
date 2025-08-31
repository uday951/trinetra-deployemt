import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Shield, Globe, Zap, MapPin, Clock, ArrowUpDown } from 'lucide-react-native';
import VPNService from '@/services/vpnService';

export default function VPNScreen() {
  const [vpnStatus, setVpnStatus] = useState(VPNService.getStatus());
  const [servers, setServers] = useState<any[]>([]);
  const [loadingServers, setLoadingServers] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ country: 'Unknown', city: 'Unknown', flag: '🌍' });

  useEffect(() => {
    loadCurrentLocation();
    loadServers();
    checkRealVPNStatus();
    
    // Update data transfer stats every 2 seconds when connected
    const interval = setInterval(() => {
      if (vpnStatus.connected) {
        VPNService.updateBytesTransferred();
        setVpnStatus(VPNService.getStatus());
      }
      // Check real VPN status every 5 seconds
      if (Date.now() % 5000 < 2000) {
        checkRealVPNStatus();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [vpnStatus.connected]);

  const checkRealVPNStatus = async () => {
    try {
      const isActive = await VPNService.checkVPNStatus();
      if (isActive !== vpnStatus.connected) {
        setVpnStatus(prev => ({ ...prev, connected: isActive }));
      }
    } catch (error) {
      console.error('Failed to check VPN status:', error);
    }
  };

  const loadServers = async () => {
    setLoadingServers(true);
    try {
      const serverList = await VPNService.getServers();
      setServers(serverList);
    } catch (error) {
      console.error('Failed to load servers:', error);
    } finally {
      setLoadingServers(false);
    }
  };

  const loadCurrentLocation = async () => {
    const ip = await VPNService.getPublicIP();
    const location = await VPNService.getIPLocation(ip);
    setCurrentLocation(location);
    setVpnStatus(prev => ({ ...prev, publicIP: ip }));
  };

  const handleConnect = async (serverId: string) => {
    setConnecting(true);
    try {
      console.log('🔄 User initiated VPN connection to:', serverId);
      
      Alert.alert(
        'VPN Permission Required',
        'This app needs VPN permission to create secure connections. Please allow VPN access when prompted.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setConnecting(false) },
          { 
            text: 'Continue', 
            onPress: async () => {
              try {
                const success = await VPNService.connect(serverId);
                
                if (success) {
                  setVpnStatus(VPNService.getStatus());
                  Alert.alert('Connected', 'VPN connection established successfully!');
                  console.log('✅ VPN connection successful');
                } else {
                  Alert.alert('Connection Failed', 'Unable to connect to VPN server. Make sure you granted VPN permission.');
                  console.log('❌ VPN connection failed');
                }
              } catch (error) {
                console.error('❌ VPN connection error:', error);
                Alert.alert('Permission Required', 'VPN permission is required. Please grant permission and try again.');
              } finally {
                setConnecting(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ VPN connection error:', error);
      Alert.alert('Error', `Connection failed: ${error.message}`);
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setConnecting(true);
    try {
      await VPNService.disconnect();
      setVpnStatus(VPNService.getStatus());
      await loadCurrentLocation();
      Alert.alert('Disconnected', 'VPN connection terminated.');
    } catch (error) {
      Alert.alert('Error', 'Disconnection failed.');
    } finally {
      setConnecting(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes.toFixed(0)} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getConnectionTime = (): string => {
    if (!vpnStatus.connectionTime) return '00:00:00';
    const diff = Date.now() - vpnStatus.connectionTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>VPN Protection</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Connection Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusDot, vpnStatus.connected ? styles.connected : styles.disconnected]} />
            <Text style={styles.statusTitle}>
              {vpnStatus.connected ? 'Protected' : 'Unprotected'}
            </Text>
          </View>
          
          {vpnStatus.connected ? (
            <View style={styles.connectedInfo}>
              <Text style={styles.serverName}>{vpnStatus.server?.flag} {vpnStatus.server?.name}</Text>
              <Text style={styles.serverDetails}>{vpnStatus.server?.city}, {vpnStatus.server?.country}</Text>
              <Text style={styles.ipAddress}>Protected IP: {vpnStatus.protectedIP}</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Clock size={16} color="#4169E1" />
                  <Text style={styles.statText}>{getConnectionTime()}</Text>
                </View>
                <View style={styles.statItem}>
                  <ArrowUpDown size={16} color="#4169E1" />
                  <Text style={styles.statText}>
                    ↑{formatBytes(vpnStatus.bytesTransferred.up)} ↓{formatBytes(vpnStatus.bytesTransferred.down)}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.disconnectButton} 
                onPress={handleDisconnect}
                disabled={connecting}
              >
                {connecting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Disconnect</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.disconnectedInfo}>
              <Text style={styles.currentLocation}>
                Current Location: {currentLocation.flag} {currentLocation.city}, {currentLocation.country}
              </Text>
              <Text style={styles.publicIP}>Public IP: {vpnStatus.publicIP}</Text>
              <Text style={styles.warningText}>Your connection is not protected</Text>
            </View>
          )}
        </View>

        {/* Server List */}
        {!vpnStatus.connected && (
          <View style={styles.serversSection}>
            <View style={styles.serverHeader}>
              <Text style={styles.sectionTitle}>Choose Server Location</Text>
              <TouchableOpacity onPress={loadServers} disabled={loadingServers}>
                <Text style={styles.refreshText}>
                  {loadingServers ? 'Loading...' : '🔄 Refresh'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {loadingServers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4169E1" />
                <Text style={styles.loadingText}>Loading VPN Gate servers...</Text>
              </View>
            ) : (
              servers.map((server) => (
              <TouchableOpacity 
                key={server.id}
                style={styles.serverCard}
                onPress={() => handleConnect(server.id)}
                disabled={connecting}
              >
                <View style={styles.serverInfo}>
                  <Text style={styles.serverFlag}>{server.flag}</Text>
                  <View style={styles.serverDetails}>
                    <Text style={styles.serverName}>{server.name}</Text>
                    <Text style={styles.serverLocation}>{server.city}, {server.country}</Text>
                  </View>
                </View>
                
                <View style={styles.serverStats}>
                  <View style={styles.serverStat}>
                    <Text style={styles.statLabel}>Ping</Text>
                    <Text style={[styles.statValue, { color: server.ping < 60 ? '#2e7d32' : server.ping < 100 ? '#ffa94d' : '#e53e3e' }]}>
                      {server.ping}ms
                    </Text>
                  </View>
                  <View style={styles.serverStat}>
                    <Text style={styles.statLabel}>Load</Text>
                    <Text style={[styles.statValue, { color: server.load < 30 ? '#2e7d32' : server.load < 60 ? '#ffa94d' : '#e53e3e' }]}>
                      {server.load}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>VPN Features</Text>
          
          <View style={styles.featureCard}>
            <Shield size={24} color="#4169E1" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Military-Grade Encryption</Text>
              <Text style={styles.featureDescription}>AES-256 encryption protects your data</Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <Globe size={24} color="#4169E1" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Global Server Network</Text>
              <Text style={styles.featureDescription}>Connect to servers worldwide</Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <Zap size={24} color="#4169E1" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>High-Speed Connection</Text>
              <Text style={styles.featureDescription}>Optimized for streaming and browsing</Text>
            </View>
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
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  connected: {
    backgroundColor: '#2e7d32',
  },
  disconnected: {
    backgroundColor: '#e53e3e',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  connectedInfo: {
    alignItems: 'center',
  },
  serverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serverDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ipAddress: {
    fontSize: 14,
    color: '#4169E1',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  disconnectButton: {
    backgroundColor: '#e53e3e',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  disconnectedInfo: {
    alignItems: 'center',
  },
  currentLocation: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  publicIP: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#e53e3e',
    fontWeight: '500',
  },
  serversSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  serverCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  serverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serverFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  serverLocation: {
    fontSize: 12,
    color: '#666',
  },
  serverStats: {
    flexDirection: 'row',
  },
  serverStat: {
    alignItems: 'center',
    marginLeft: 16,
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  featuresSection: {
    margin: 16,
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureContent: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  serverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshText: {
    fontSize: 14,
    color: '#4169E1',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});