declare module 'react-native-installed-apps' {
  interface InstalledApp {
    appName: string;
    packageName: string;
    versionName?: string;
    versionCode?: number;
    firstInstallTime?: number;
    lastUpdateTime?: number;
    permissions?: string[];
  }

  interface InstalledAppsStatic {
    getApps(): Promise<InstalledApp[]>;
    getInstalledApps(): Promise<InstalledApp[]>;
    isAppLocked(packageName: string): Promise<boolean>;
    setAppLock(packageName: string, lockStatus: boolean): Promise<void>;
  }

  const InstalledApps: InstalledAppsStatic;
  export default InstalledApps;
} 