import { NativeModules } from 'react-native';

export function debugAvailableModules() {
  console.log('🔍 Available Native Modules:');
  Object.keys(NativeModules).forEach(moduleName => {
    console.log(`  - ${moduleName}`);
  });
  
  // Check specifically for battery-related modules
  const batteryModules = Object.keys(NativeModules).filter(name => 
    name.toLowerCase().includes('battery') || 
    name.toLowerCase().includes('device') ||
    name.toLowerCase().includes('info')
  );
  
  console.log('🔋 Battery/Device related modules:', batteryModules);
  
  // Check if our custom module exists
  if (NativeModules.BatteryModule) {
    console.log('✅ BatteryModule found!');
    console.log('BatteryModule methods:', Object.keys(NativeModules.BatteryModule));
  } else {
    console.log('❌ BatteryModule not found');
  }
  
  return {
    allModules: Object.keys(NativeModules),
    batteryModules,
    hasBatteryModule: !!NativeModules.BatteryModule
  };
}