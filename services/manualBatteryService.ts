import AsyncStorage from '@react-native-async-storage/async-storage';

export class ManualBatteryService {
  // Allow manual battery input for testing
  static async setManualBattery(level: number, isCharging: boolean) {
    try {
      const batteryData = {
        level: Math.max(0, Math.min(100, level)), // Clamp between 0-100
        isCharging,
        timestamp: Date.now(),
        isManual: true
      };
      
      await AsyncStorage.setItem('manualBattery', JSON.stringify(batteryData));
      console.log('✅ Manual battery set:', batteryData);
      return batteryData;
    } catch (error) {
      console.error('Error setting manual battery:', error);
      return null;
    }
  }
  
  static async getManualBattery() {
    try {
      const data = await AsyncStorage.getItem('manualBattery');
      if (data) {
        const batteryData = JSON.parse(data);
        // Check if data is less than 5 minutes old
        const isRecent = (Date.now() - batteryData.timestamp) < 5 * 60 * 1000;
        
        if (isRecent && batteryData.isManual) {
          console.log('📱 Using manual battery data:', batteryData);
          return batteryData;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting manual battery:', error);
      return null;
    }
  }
  
  static async clearManualBattery() {
    try {
      await AsyncStorage.removeItem('manualBattery');
      console.log('🗑️ Manual battery data cleared');
    } catch (error) {
      console.error('Error clearing manual battery:', error);
    }
  }
  
  // Quick presets for testing
  static async setLowBattery() {
    return await this.setManualBattery(15, false);
  }
  
  static async setChargingBattery() {
    return await this.setManualBattery(65, true);
  }
  
  static async setFullBattery() {
    return await this.setManualBattery(100, false);
  }
}

export default ManualBatteryService;