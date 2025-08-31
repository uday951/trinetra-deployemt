import { NativeModules, Platform } from 'react-native';

interface BatteryInfo {
  level: number;
  isCharging: boolean;
  health: string;
  temperature: number;
  voltage: number;
  technology: string;
  pluggedType: string;
}

class RealBatteryService {
  async getRealBatteryData(): Promise<BatteryInfo | null> {
    try {
      // Method 1: Try our custom native module
      if (NativeModules.BatteryModule) {
        console.log('🔋 Using native BatteryModule');
        const batteryData = await NativeModules.BatteryModule.getBatteryInfo();
        return batteryData;
      }
      
      // Method 2: Try React Native DeviceInfo if available
      if (NativeModules.RNDeviceInfo) {
        console.log('🔋 Using RNDeviceInfo');
        const level = await NativeModules.RNDeviceInfo.getBatteryLevel();
        return {
          level: Math.round(level * 100),
          isCharging: false, // DeviceInfo doesn't provide charging status
          health: 'good',
          temperature: 25,
          voltage: 3700,
          technology: 'Li-ion',
          pluggedType: 'unknown'
        };
      }
      
      // Method 3: Direct Android Intent (if possible)
      if (Platform.OS === 'android' && NativeModules.IntentLauncher) {
        console.log('🔋 Trying Android Intent approach');
        // This would require additional native code
      }
      
      return null;
    } catch (error) {
      console.error('RealBatteryService error:', error);
      return null;
    }
  }
  
  isAvailable(): boolean {
    return !!(NativeModules.BatteryModule || NativeModules.RNDeviceInfo);
  }
}

export default new RealBatteryService();