module.exports = {
  dependencies: {
    'react-native-device-info': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-device-info/android',
          packageImportPath: 'import io.invertase.firebase.RNFirebasePackage;',
        },
      },
    },
  },
};