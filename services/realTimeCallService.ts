import { NativeModules, NativeEventEmitter, DeviceEventEmitter, PermissionsAndroid, Platform } from 'react-native';
import spamCallService from './spamCallService';

const { CallControl } = NativeModules;

interface CallEvent {
  type: 'incoming_call' | 'call_answered' | 'call_ended' | 'call_blocked';
  phoneNumber: string;
  timestamp: number;
}

class RealTimeCallService {
  private eventEmitter: NativeEventEmitter | null = null;
  private isMonitoring = false;
  private callEventListener: any = null;

  constructor() {
    if (Platform.OS === 'android') {
      this.setupEventListener();
    }
  }

  private setupEventListener() {
    this.callEventListener = DeviceEventEmitter.addListener('CallEvent', this.handleCallEvent.bind(this));
  }

  private async handleCallEvent(event: CallEvent) {
    console.log('Call event received:', event);
    
    if (event.type === 'incoming_call') {
      await this.handleIncomingCall(event.phoneNumber);
    }
  }

  private async handleIncomingCall(phoneNumber: string) {
    try {
      // Check if number is blocked
      const isBlocked = await this.isNumberBlocked(phoneNumber);
      if (isBlocked) {
        console.log('Blocking call from:', phoneNumber);
        await this.endCall();
        return;
      }

      // Check spam status
      const spamCheck = await spamCallService.checkPhoneNumber(phoneNumber);
      
      if (spamCheck.isSpam && spamCheck.riskLevel === 'high') {
        console.log('Auto-blocking spam call from:', phoneNumber);
        await this.blockNumber(phoneNumber);
        await this.endCall();
      }
    } catch (error) {
      console.error('Error handling incoming call:', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        PermissionsAndroid.PERMISSIONS.ANSWER_PHONE_CALLS,
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
      ];

      const results = await PermissionsAndroid.requestMultiple(permissions);
      
      return Object.values(results).every(result => result === PermissionsAndroid.RESULTS.GRANTED);
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async answerCall(): Promise<boolean> {
    try {
      if (!CallControl) return false;
      return await CallControl.answerCall();
    } catch (error) {
      console.error('Failed to answer call:', error);
      return false;
    }
  }

  async endCall(): Promise<boolean> {
    try {
      if (!CallControl) return false;
      return await CallControl.endCall();
    } catch (error) {
      console.error('Failed to end call:', error);
      return false;
    }
  }

  async blockNumber(phoneNumber: string): Promise<boolean> {
    try {
      if (!CallControl) return false;
      const result = await CallControl.blockNumber(phoneNumber);
      spamCallService.blockNumber(phoneNumber);
      return result;
    } catch (error) {
      console.error('Failed to block number:', error);
      return false;
    }
  }

  async isNumberBlocked(phoneNumber: string): Promise<boolean> {
    try {
      if (!CallControl) return false;
      return await CallControl.isNumberBlocked(phoneNumber);
    } catch (error) {
      console.error('Failed to check if number is blocked:', error);
      return false;
    }
  }

  async getRecentCalls(): Promise<any[]> {
    try {
      if (!CallControl) return [];
      const calls = await CallControl.getRecentCalls();
      return calls || [];
    } catch (error) {
      console.error('Failed to get recent calls:', error);
      return [];
    }
  }

  startMonitoring(): boolean {
    this.isMonitoring = true;
    console.log('Real-time call monitoring started');
    return true;
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('Real-time call monitoring stopped');
  }

  cleanup() {
    if (this.callEventListener) {
      this.callEventListener.remove();
    }
  }
}

export default new RealTimeCallService();