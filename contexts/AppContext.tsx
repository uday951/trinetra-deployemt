import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

type AppContextType = {
  // Scan state
  scanResult: any;
  isScanning: boolean;
  scanError: string | null;
  
  // Device state
  deviceInfo: any;
  isDeviceLoading: boolean;
  deviceError: string | null;
  
  // SOS state
  isSosActive: boolean;
  
  // VPN state
  isVpnConnected: boolean;
  vpnStatus: string;
  
  // Actions
  scanFile: (file: File) => Promise<void>;
  scanUrl: (url: string) => Promise<void>;
  scanIp: (ip: string) => Promise<void>;
  getDeviceInfo: () => Promise<void>;
  sendSos: (location: { latitude: number; longitude: number }) => Promise<void>;
  connectVpn: (config: any) => Promise<void>;
  disconnectVpn: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);
  
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [isDeviceLoading, setIsDeviceLoading] = useState<boolean>(false);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  
  const [isSosActive, setIsSosActive] = useState<boolean>(false);
  
  const [isVpnConnected, setIsVpnConnected] = useState<boolean>(false);
  const [vpnStatus, setVpnStatus] = useState<string>('disconnected');

  // Scan functions
  const scanFile = async (file: File) => {
    setIsScanning(true);
    setScanError(null);
    try {
      const result = await api.scanApi.scanFile(file);
      setScanResult(result);
    } catch (error: any) {
      setScanError(error.message || 'Failed to scan file');
    } finally {
      setIsScanning(false);
    }
  };

  const scanUrl = async (url: string) => {
    setIsScanning(true);
    setScanError(null);
    try {
      const result = await api.scanApi.scanUrl(url);
      setScanResult(result);
    } catch (error: any) {
      setScanError(error.message || 'Failed to scan URL');
    } finally {
      setIsScanning(false);
    }
  };

  const scanIp = async (ip: string) => {
    setIsScanning(true);
    setScanError(null);
    try {
      const result = await api.scanApi.scanIp(ip);
      setScanResult(result);
    } catch (error: any) {
      setScanError(error.message || 'Failed to scan IP');
    } finally {
      setIsScanning(false);
    }
  };

  // Device functions
  const getDeviceInfo = async () => {
    setIsDeviceLoading(true);
    setDeviceError(null);
    try {
      const info = await api.deviceApi.getDeviceInfo();
      setDeviceInfo(info);
    } catch (error: any) {
      setDeviceError(error.message || 'Failed to get device info');
    } finally {
      setIsDeviceLoading(false);
    }
  };

  // SOS functions
  const sendSos = async (location: { latitude: number; longitude: number }) => {
    try {
      await api.sosApi.sendSos(location);
      setIsSosActive(true);
    } catch (error) {
      console.error('Failed to send SOS:', error);
      throw error;
    }
  };

  // VPN functions
  const connectVpn = async (config: any) => {
    try {
      await api.vpnApi.connectVpn(config);
      setIsVpnConnected(true);
      setVpnStatus('connected');
    } catch (error) {
      console.error('Failed to connect to VPN:', error);
      setVpnStatus('error');
      throw error;
    }
  };

  const disconnectVpn = async () => {
    try {
      await api.vpnApi.disconnectVpn();
      setIsVpnConnected(false);
      setVpnStatus('disconnected');
    } catch (error) {
      console.error('Failed to disconnect from VPN:', error);
      throw error;
    }
  };

  // Initial data loading
  useEffect(() => {
    getDeviceInfo();
  }, []);

  const value = {
    // State
    scanResult,
    isScanning,
    scanError,
    deviceInfo,
    isDeviceLoading,
    deviceError,
    isSosActive,
    isVpnConnected,
    vpnStatus,
    
    // Actions
    scanFile,
    scanUrl,
    scanIp,
    getDeviceInfo,
    sendSos,
    connectVpn,
    disconnectVpn,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
