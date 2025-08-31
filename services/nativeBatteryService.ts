import { NativeModules, Platform } from 'react-native';

interface BatteryInfo {
  level: number;
  isCharging: boolean;
  health: 'good' | 'overheat' | 'dead' | 'cold' | 'unknown';
  temperature: number;
  voltage: number;
  technology: string;
  pluggedType: 'ac' | 'usb' | 'wireless' | 'unplugged';
  status: string;
}

const { BatteryModule } = NativeModules;

export class NativeBatteryService {
  static async getRealBatteryInfo(): Promise<BatteryInfo> {
    try {
      if (Platform.OS === 'android' && BatteryModule) {
        const batteryInfo = await BatteryModule.getBatteryInfo();
        console.log('🔋 REAL BATTERY DATA FROM DEVICE:', batteryInfo);
        return batteryInfo;
      } else {
        throw new Error('Native battery module not available');
      }
    } catch (error) {
      console.error('Native battery error:', error);
      throw error;
    }
  }

  static async startBatteryMonitoring() {
    try {
      if (Platform.OS === 'android' && BatteryModule) {
        await BatteryModule.startBatteryMonitoring();
        console.log('🔋 Battery monitoring started');
      }
    } catch (error) {
      console.error('Error starting battery monitoring:', error);
    }
  }

  static isAvailable(): boolean {
    return Platform.OS === 'android' && !!BatteryModule;
  }
}

export default NativeBatteryService;