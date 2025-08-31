const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add react-native-device-info to resolver
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add path alias resolver
config.resolver.alias = {
  '@': path.resolve(__dirname),
};

// Ensure resolver can find aliased modules
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;