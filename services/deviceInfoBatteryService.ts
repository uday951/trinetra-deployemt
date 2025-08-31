class DeviceInfoBatteryService {
  async getRealBatteryData() {
    try {
      // Try to import DeviceInfo safely
      const DeviceInfo = require('react-native-device-info');
      
      const batteryLevel = await DeviceInfo.getBatteryLevel();
      const isCharging = await DeviceInfo.isBatteryCharging();
      
      console.log('🔋 REAL BATTERY FROM DEVICE-INFO:', {
        level: Math.round(batteryLevel * 100) + '%',
        charging: isCharging
      });
      
      return {
        level: Math.round(batteryLevel * 100),
        isCharging,
        health: 'good',
        temperature: 25,
        voltage: 3700,
        technology: 'Li-ion'
      };
    } catch (error) {
      console.log('DeviceInfo not available, using fallback');
      return null;
    }
  }
}

export default new DeviceInfoBatteryService();