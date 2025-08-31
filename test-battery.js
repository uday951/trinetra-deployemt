// Simple battery test script
console.log('Testing battery APIs...');

// Test 1: Web Battery API
if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
  navigator.getBattery().then(battery => {
    console.log('✅ Web Battery API works!');
    console.log('Level:', Math.round(battery.level * 100) + '%');
    console.log('Charging:', battery.charging);
  }).catch(err => {
    console.log('❌ Web Battery API failed:', err.message);
  });
} else {
  console.log('❌ Web Battery API not available');
}

// Test 2: Expo Battery API
try {
  const Battery = require('expo-battery');
  Battery.getBatteryLevelAsync().then(level => {
    console.log('✅ Expo Battery API works!');
    console.log('Level:', Math.round(level * 100) + '%');
  }).catch(err => {
    console.log('❌ Expo Battery API failed:', err.message);
  });
} catch (err) {
  console.log('❌ Expo Battery not available:', err.message);
}