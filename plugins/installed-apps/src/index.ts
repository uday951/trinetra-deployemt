import { requireNativeModule } from 'expo-modules-core';

export interface InstalledApp {
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  permissions: string[];
  risk: 'low' | 'medium' | 'high';
  installTime: number;
  lastUpdateTime: number;
  isLocked?: boolean;
}

interface InstalledAppsModule {
  getInstalledApps(): Promise<InstalledApp[]>;
  isAppLocked(packageName: string): Promise<boolean>;
  setAppLock(packageName: string, locked: boolean): Promise<boolean>;
}

export const InstalledApps = requireNativeModule<InstalledAppsModule>('InstalledApps');

export default InstalledApps; 