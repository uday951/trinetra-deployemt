const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withInstalledAppsPlugin(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // Add QUERY_ALL_PACKAGES permission
    if (!androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = [];
    }
    
    androidManifest.manifest['uses-permission'].push({
      $: {
        'android:name': 'android.permission.QUERY_ALL_PACKAGES',
      },
    });

    return config;
  });
}; 