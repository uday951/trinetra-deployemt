import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, PhoneOff, Search, Shield, AlertTriangle, RefreshCw } from 'lucide-react-native';
import { useCallMonitor } from '../../hooks/useCallMonitor';
import spamCallService from '../../services/spamCallService';
import realTimeCallService from '../../services/realTimeCallService';

export default function SpamCallsScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [recentCalls, setRecentCalls] = useState<any[]>([]);
  
  const {
    callHistory,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    blockNumber,
    allowNumber
  } = useCallMonitor();

  useEffect(() => {
    if (isMonitoring) {
      loadRecentCalls();
    }
  }, [isMonitoring]);

  const handleCheckNumber = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    setIsChecking(true);
    try {
      const result = await spamCallService.checkPhoneNumber(phoneNumber);
      setCheckResult(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to check phone number');
    } finally {
      setIsChecking(false);
    }
  };

  const handleBlockNumber = async () => {
    if (!phoneNumber.trim()) return;
    const success = await realTimeCallService.blockNumber(phoneNumber);
    if (success) {
      blockNumber(phoneNumber);
      Alert.alert('Success', `${phoneNumber} blocked - future calls will be auto-rejected`);
    } else {
      Alert.alert('Error', 'Failed to block number');
    }
    setPhoneNumber('');
    setCheckResult(null);
  };

  const handleAllowNumber = () => {
    if (!phoneNumber.trim()) return;
    allowNumber(phoneNumber);
    Alert.alert('Success', `${phoneNumber} whitelisted - calls will always be allowed`);
    setPhoneNumber('');
    setCheckResult(null);
  };

  const loadRecentCalls = async () => {
    try {
      const calls = await realTimeCallService.getRecentCalls();
      setRecentCalls(calls);
    } catch (error) {
      console.error('Failed to load recent calls:', error);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const renderCallHistoryItem = ({ item }: { item: any }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <Text style={styles.phoneNumberText}>{item.phoneNumber}</Text>
        <View style={[styles.riskBadge, { backgroundColor: getRiskColor(item.riskLevel) }]}>
          <Text style={styles.riskText}>{item.riskLevel.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.timestampText}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
      <Text style={[styles.actionText, { color: item.action === 'blocked' ? '#EF4444' : '#10B981' }]}>
        {item.action === 'blocked' ? 'BLOCKED' : 'ALLOWED'}
      </Text>
    </View>
  );

  const renderRecentCall = ({ item }: { item: any }) => (
    <View style={styles.recentCallItem}>
      <View style={styles.callInfo}>
        <Text style={styles.callNumber}>{item.phoneNumber}</Text>
        <Text style={styles.callTime}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
        <Text style={styles.callType}>
          {item.type === 1 ? 'Incoming' : item.type === 2 ? 'Outgoing' : 'Missed'}
          {item.duration > 0 && ` • ${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}`}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.miniButton, { backgroundColor: '#EF4444' }]}
        onPress={async () => {
          const success = await realTimeCallService.blockNumber(item.phoneNumber);
          if (success) {
            Alert.alert('Success', `${item.phoneNumber} has been blocked`);
            loadRecentCalls();
          }
        }}
      >
        <Text style={styles.miniButtonText}>Block</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.headerCard}
      >
        <View style={styles.headerContent}>
          <Shield size={32} color="#EF4444" />
          <Text style={styles.headerTitle}>Spam Call Protection</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.monitorButton,
            isMonitoring ? styles.activeButton : styles.inactiveButton
          ]}
          onPress={async () => {
            if (isMonitoring) {
              stopMonitoring();
              realTimeCallService.stopMonitoring();
            } else {
              const hasPermissions = await realTimeCallService.requestPermissions();
              if (!hasPermissions) {
                Alert.alert('Permissions Required', 'Please grant phone and call log permissions to enable call monitoring.');
                return;
              }
              startMonitoring();
              realTimeCallService.startMonitoring();
              await loadRecentCalls();
            }
          }}
        >
          {isMonitoring ? (
            <PhoneOff size={24} color="#FFFFFF" />
          ) : (
            <Phone size={24} color="#FFFFFF" />
          )}
          <Text style={styles.buttonText}>
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#9333EA', marginTop: 12 }]}
          onPress={async () => {
            const { NativeModules } = require('react-native');
            const { SpamOverlay } = NativeModules;
            if (SpamOverlay) {
              try {
                const canDraw = await SpamOverlay.canDrawOverlays();
                if (!canDraw) {
                  Alert.alert(
                    'Permission Required',
                    'Enable "Display over other apps" permission for spam alerts.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Open Settings', 
                        onPress: () => SpamOverlay.requestOverlayPermission()
                      }
                    ]
                  );
                  return;
                }
                
                await SpamOverlay.showSpamOverlay('+1234567890', true, 'high', 'Test spam call overlay');
                Alert.alert('Success', 'Spam alert overlay shown!');
              } catch (error) {
                Alert.alert('Error', 'Failed to show overlay: ' + error.message);
              }
            } else {
              Alert.alert('Error', 'SpamOverlay module not available');
            }
          }}
        >
          <Text style={styles.actionButtonText}>Test Spam Alert</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Phone Number Checker */}
      <View style={styles.checkerCard}>
        <Text style={styles.cardTitle}>Check Phone Number</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.phoneInput}
            placeholder="Enter phone number (e.g., +1234567890)"
            placeholderTextColor="#9CA3AF"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <TouchableOpacity
            style={styles.checkButton}
            onPress={handleCheckNumber}
            disabled={isChecking}
          >
            <Search size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {checkResult && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <AlertTriangle 
                size={24} 
                color={getRiskColor(checkResult.riskLevel)} 
              />
              <Text style={[styles.resultTitle, { color: getRiskColor(checkResult.riskLevel) }]}>
                {checkResult.isSpam ? 'SPAM DETECTED' : 'NUMBER APPEARS SAFE'}
              </Text>
            </View>
            
            <Text style={styles.resultText}>
              Risk Level: {checkResult.riskLevel.toUpperCase()}
            </Text>
            <Text style={styles.resultText}>
              Reason: {checkResult.reason}
            </Text>
            
            {checkResult.phoneInfo && (
              <View style={styles.phoneInfoCard}>
                <Text style={styles.infoTitle}>Phone Information:</Text>
                <Text style={styles.infoText}>Country: {checkResult.phoneInfo.country_name}</Text>
                <Text style={styles.infoText}>Carrier: {checkResult.phoneInfo.carrier}</Text>
                <Text style={styles.infoText}>Line Type: {checkResult.phoneInfo.line_type}</Text>
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.blockButton]}
                onPress={handleBlockNumber}
              >
                <Text style={styles.actionButtonText}>Block & Auto-Reject</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.allowButton]}
                onPress={handleAllowNumber}
              >
                <Text style={styles.actionButtonText}>Allow & Whitelist</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Call Control */}
      <View style={styles.callControlCard}>
        <Text style={styles.cardTitle}>Call Control</Text>
        
        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: '#10B981' }]}
            onPress={async () => {
              const success = await realTimeCallService.answerCall();
              Alert.alert(success ? 'Success' : 'Error', success ? 'Call answered' : 'Failed to answer call');
            }}
          >
            <Phone size={20} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>Answer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: '#EF4444' }]}
            onPress={async () => {
              const success = await realTimeCallService.endCall();
              Alert.alert(success ? 'Success' : 'Error', success ? 'Call ended' : 'Failed to end call');
            }}
          >
            <PhoneOff size={20} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>End Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: '#6366F1' }]}
            onPress={loadRecentCalls}
          >
            <RefreshCw size={20} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Calls */}
      {recentCalls.length > 0 && (
        <View style={styles.recentCallsCard}>
          <Text style={styles.cardTitle}>Recent Calls ({recentCalls.length})</Text>
          
          <FlatList
            data={recentCalls.slice(0, 10)}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderRecentCall}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Call History */}
      {callHistory.length > 0 && (
        <View style={styles.historyCard}>
          <Text style={styles.cardTitle}>Spam Detection History</Text>
          
          <FlatList
            data={callHistory}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderCallHistoryItem}
            scrollEnabled={false}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  headerCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  monitorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  activeButton: {
    backgroundColor: '#10B981',
  },
  inactiveButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  checkerCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#1F2937',
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#374151',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  checkButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultText: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 4,
  },
  phoneInfoCard: {
    backgroundColor: '#4B5563',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    color: '#D1D5DB',
    fontSize: 13,
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  blockButton: {
    backgroundColor: '#EF4444',
  },
  allowButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  callControlCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#1F2937',
    borderRadius: 16,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  recentCallsCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#1F2937',
    borderRadius: 16,
  },
  recentCallItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#374151',
    borderRadius: 8,
    marginBottom: 8,
  },
  callInfo: {
    flex: 1,
  },
  callNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  callTime: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  callType: {
    color: '#D1D5DB',
    fontSize: 12,
    marginTop: 2,
  },
  miniButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  miniButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  historyCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#1F2937',
    borderRadius: 16,
  },
  historyItem: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  phoneNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  riskText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timestampText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 2,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});