// Test script to verify device info functionality
const DeviceInfo = require('react-native-device-info');

async function testDeviceInfo() {
  console.log('Testing Device Info APIs...');
  
  try {
    const deviceName = DeviceInfo.getDeviceNameSync();
    console.log('Device Name:', deviceName);
    
    const brand = DeviceInfo.getBrand();
    console.log('Brand:', brand);
    
    const model = DeviceInfo.getModel();
    console.log('Model:', model);
    
    const batteryLevel = await DeviceInfo.getBatteryLevel();
    console.log('Battery Level:', batteryLevel);
    
    console.log('✅ Device Info APIs working correctly');
  } catch (error) {
    console.log('❌ Device Info APIs error:', error.message);
  }
}

testDeviceInfo();