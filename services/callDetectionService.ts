import { NativeModules, NativeEventEmitter, PermissionsAndroid, Platform, Alert } from 'react-native';
import spamCallService from './spamCallService';

const { CallDetection } = NativeModules;

class CallDetectionService {
  private eventEmitter: NativeEventEmitter | null = null;
  private callListener: any = null;
  private isMonitoring = false;

  constructor() {
    if (Platform.OS === 'android' && CallDetection) {
      this.eventEmitter = new NativeEventEmitter(CallDetection);
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
      ];

      const results = await PermissionsAndroid.requestMultiple(permissions);
      
      return Object.values(results).every(
        result => result === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async startMonitoring(): Promise<boolean> {
    if (!CallDetection || this.isMonitoring) {
      return false;
    }

    try {
      // Request permissions first
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        Alert.alert(
          'Permissions Required',
          'Phone permissions are required for call detection. Please grant them in settings.'
        );
        return false;
      }

      // Start native monitoring
      await CallDetection.startCallMonitoring();

      // Listen for incoming calls
      this.callListener = this.eventEmitter?.addListener(
        'onIncomingCall',
        this.handleIncomingCall.bind(this)
      );

      this.isMonitoring = true;
      console.log('Call monitoring started');
      return true;
    } catch (error) {
      console.error('Failed to start call monitoring:', error);
      return false;
    }
  }

  async stopMonitoring(): Promise<void> {
    if (!CallDetection || !this.isMonitoring) {
      return;
    }

    try {
      await CallDetection.stopCallMonitoring();
      this.callListener?.remove();
      this.callListener = null;
      this.isMonitoring = false;
      console.log('Call monitoring stopped');
    } catch (error) {
      console.error('Failed to stop call monitoring:', error);
    }
  }

  private async handleIncomingCall(callData: { phoneNumber: string; state: string }) {
    console.log('Incoming call detected:', callData);

    try {
      // Check if number is spam
      const spamCheck = await spamCallService.checkPhoneNumber(callData.phoneNumber);
      
      if (spamCheck.isSpam) {
        // Show Truecaller-like alert
        this.showSpamAlert(callData.phoneNumber, spamCheck);
      } else {
        // Show caller info for legitimate calls
        this.showCallerInfo(callData.phoneNumber, spamCheck);
      }
    } catch (error) {
      console.error('Failed to check incoming call:', error);
    }
  }

  private showSpamAlert(phoneNumber: string, spamInfo: any) {
    Alert.alert(
      '🚨 SPAM CALL DETECTED',
      `${phoneNumber}\n\nRisk: ${spamInfo.riskLevel.toUpperCase()}\nReason: ${spamInfo.reason}\n\nThis call may be spam or fraudulent.`,
      [
        {
          text: 'Block & Reject',
          style: 'destructive',
          onPress: () => {
            spamCallService.blockNumber(phoneNumber);
            // In a real app, you'd reject the call here
            console.log('Call blocked and rejected');
          }
        },
        {
          text: 'Answer Anyway',
          style: 'default'
        },
        {
          text: 'Add to Whitelist',
          onPress: () => spamCallService.allowNumber(phoneNumber)
        }
      ],
      { cancelable: false }
    );
  }

  private showCallerInfo(phoneNumber: string, info: any) {
    if (info.phoneInfo) {
      Alert.alert(
        '📞 Incoming Call',
        `${phoneNumber}\n\nCountry: ${info.phoneInfo.country_name}\nCarrier: ${info.phoneInfo.carrier}\nType: ${info.phoneInfo.line_type}`,
        [
          { text: 'Answer', style: 'default' },
          { text: 'Decline', style: 'cancel' }
        ]
      );
    }
  }

  getMonitoringStatus(): boolean {
    return this.isMonitoring;
  }

  // Test function to simulate incoming call
  async testIncomingCall(phoneNumber: string = '+1234567890') {
    if (this.isMonitoring) {
      await this.handleIncomingCall({
        phoneNumber,
        state: 'incoming'
      });
    } else {
      Alert.alert('Error', 'Call monitoring is not active');
    }
  }
}

export default new CallDetectionService();