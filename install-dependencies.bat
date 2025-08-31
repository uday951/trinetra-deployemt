@echo off
echo Installing required dependencies for device features...

echo Installing AsyncStorage...
npm install @react-native-async-storage/async-storage

echo Installing Expo Device...
npx expo install expo-device

echo Installing Expo Battery...
npx expo install expo-battery

echo Installing Expo System...
npx expo install expo-system

echo Dependencies installed successfully!
echo You can now use the device features with real data.
pause