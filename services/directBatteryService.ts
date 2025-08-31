import { NativeModules, Platform } from 'react-native';

class DirectBatteryService {
  async getDirectBatteryLevel(): Promise<{ level: number; isCharging: boolean } | null> {
    try {
      if (Platform.OS === 'android') {
        // Try to access Android's BatteryManager directly through existing modules
        const { BatteryModule } = NativeModules;
        
        if (BatteryModule && BatteryModule.getBatteryInfo) {
          console.log('🔋 Calling native getBatteryInfo...');
          const result = await BatteryModule.getBatteryInfo();
          console.log('🔋 Native battery result:', result);
          return {
            level: result.level,
            isCharging: result.isCharging
          };
        }
        
        // Fallback: Check if any other modules can provide battery info
        const moduleNames = Object.keys(NativeModules);
        console.log('📱 Available modules:', moduleNames.slice(0, 10)); // Show first 10
        
        // Look for any module that might have battery info
        for (const moduleName of moduleNames) {
          const module = NativeModules[moduleName];
          if (module && typeof module === 'object') {
            const methods = Object.keys(module);
            const batteryMethods = methods.filter(method => 
              method.toLowerCase().includes('battery') ||
              method.toLowerCase().includes('power') ||
              method.toLowerCase().includes('charge')
            );
            
            if (batteryMethods.length > 0) {
              console.log(`🔋 Found battery methods in ${moduleName}:`, batteryMethods);
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('DirectBatteryService error:', error);
      return null;
    }
  }
}

export default new DirectBatteryService();