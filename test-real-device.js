// Test script to verify real device data
const RealDeviceDataService = require('./services/realDeviceDataService').default;

async function testRealDeviceData() {
  try {
    console.log('Testing real device data...');
    const metrics = await RealDeviceDataService.getDeviceMetrics();
    
    console.log('✅ Real Device Data Retrieved:');
    console.log('Device:', metrics.device.manufacturer, metrics.device.modelName);
    console.log('Battery:', metrics.battery.level + '%', metrics.battery.isCharging ? '(Charging)' : '(Not Charging)');
    console.log('Memory:', RealDeviceDataService.formatBytes(metrics.memory.available), 'available');
    console.log('Storage:', RealDeviceDataService.formatBytes(metrics.storage.available), 'free');
    console.log('Network:', metrics.network.type, metrics.network.isConnected ? '(Connected)' : '(Disconnected)');
    
  } catch (error) {
    console.error('❌ Real device data test failed:', error.message);
  }
}

testRealDeviceData();