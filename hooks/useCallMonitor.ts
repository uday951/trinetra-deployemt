import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import spamCallService from '../services/spamCallService';

interface CallEvent {
  phoneNumber: string;
  timestamp: Date;
  isSpam: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  action: 'blocked' | 'allowed' | 'warned';
}

export const useCallMonitor = () => {
  const [callHistory, setCallHistory] = useState<CallEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const checkIncomingCall = async (phoneNumber: string) => {
    try {
      // Check if number is in allow/block lists first
      if (spamCallService.isAllowed(phoneNumber)) {
        const event: CallEvent = {
          phoneNumber,
          timestamp: new Date(),
          isSpam: false,
          riskLevel: 'low',
          action: 'allowed'
        };
        setCallHistory(prev => [event, ...prev]);
        return { shouldBlock: false, reason: 'Number is whitelisted' };
      }

      if (spamCallService.isBlocked(phoneNumber)) {
        const event: CallEvent = {
          phoneNumber,
          timestamp: new Date(),
          isSpam: true,
          riskLevel: 'high',
          action: 'blocked'
        };
        setCallHistory(prev => [event, ...prev]);
        return { shouldBlock: true, reason: 'Number is blacklisted' };
      }

      // Check with NumVerify API
      const spamCheck = await spamCallService.checkPhoneNumber(phoneNumber);
      
      const event: CallEvent = {
        phoneNumber,
        timestamp: new Date(),
        isSpam: spamCheck.isSpam,
        riskLevel: spamCheck.riskLevel,
        action: spamCheck.isSpam ? 'blocked' : 'allowed'
      };

      setCallHistory(prev => [event, ...prev]);

      if (spamCheck.isSpam) {
        Alert.alert(
          'Spam Call Detected',
          `${phoneNumber}\nRisk: ${spamCheck.riskLevel.toUpperCase()}\nReason: ${spamCheck.reason}`,
          [
            { text: 'Block', onPress: () => spamCallService.blockNumber(phoneNumber) },
            { text: 'Allow Once', style: 'cancel' },
            { text: 'Whitelist', onPress: () => spamCallService.allowNumber(phoneNumber) }
          ]
        );
      }

      return {
        shouldBlock: spamCheck.isSpam,
        reason: spamCheck.reason,
        riskLevel: spamCheck.riskLevel
      };
    } catch (error) {
      console.error('Call monitoring error:', error);
      return { shouldBlock: false, reason: 'Monitoring error' };
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    // In a real app, you'd integrate with native call detection
    console.log('Call monitoring started');
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    console.log('Call monitoring stopped');
  };

  const blockNumber = (phoneNumber: string) => {
    spamCallService.blockNumber(phoneNumber);
  };

  const allowNumber = (phoneNumber: string) => {
    spamCallService.allowNumber(phoneNumber);
  };

  return {
    callHistory,
    isMonitoring,
    checkIncomingCall,
    startMonitoring,
    stopMonitoring,
    blockNumber,
    allowNumber
  };
};