import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { handleApiError } from '../utils/apiErrorHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: AxiosRequestConfig;
  request?: any;
}

// Create axios instance with base URL
const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://192.168.217.49:5000',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include auth token if available
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // Optionally log or handle AsyncStorage error
      console.warn('Failed to get token from AsyncStorage:', err);
    }
    // Add request timestamp
    config.headers['X-Request-Timestamp'] = new Date().toISOString();
    return config;
  },
  (error) => {
    return Promise.reject(handleApiError(error));
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    return Promise.reject(handleApiError(error));
  }
);

// Helper function to make API requests
const apiRequest = async <T = any>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance.request<T>(config);
    return response;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

// HTTP methods
export const http = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'GET', url }),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'POST', url, data }),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'DELETE', url }),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),
};

// Types for API responses
interface ScanResult {
  isMalicious: boolean;
  threats: string[];
  scanDetails: any;
  timestamp: string;
}

interface DeviceInfo {
  id: string;
  name: string;
  os: string;
  ipAddress: string;
  lastSeen: string;
  status: 'online' | 'offline' | 'warning';
}

interface VpnConfig {
  server: string;
  username: string;
  password: string;
  protocol?: 'udp' | 'tcp';
  port?: number;
}

// API functions
// API Modules
export const scanApi = {
  // File Scan
  scanFile: async (file: File): Promise<ScanResult> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await http.post<ScanResult>('/api/security/scan-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // URL Scan
  scanUrl: async (url: string): Promise<ScanResult> => {
    const response = await http.post<ScanResult>('/api/security/check-url', { url });
    return response.data;
  },

  // IP Address Scan
  scanIp: async (ip: string): Promise<ScanResult> => {
    const response = await http.post<ScanResult>('/api/security/check-ip', { ip });
    return response.data;
  },
};

export const deviceApi = {
  // Get device information
  getDeviceInfo: async (): Promise<DeviceInfo> => {
    const response = await http.get<DeviceInfo>('/api/device/info');
    return response.data;
  },
};

export const sosApi = {
  // Send SOS alert
  sendSos: async (location: { latitude: number; longitude: number }): Promise<{ success: boolean; message: string }> => {
    const response = await http.post('/api/sos/alert', { 
      location,
      timestamp: new Date().toISOString(),
    });
    
    return response.data;
  },
};

export const vpnApi = {
  // Connect to VPN
  connectVpn: async (config: VpnConfig): Promise<{ success: boolean; message: string }> => {
    const response = await http.post('/api/vpn/connect', {
      ...config,
      protocol: config.protocol || 'udp',
      port: config.port || (config.protocol === 'tcp' ? 1194 : 1194),
    });
    
    return response.data;
  },
  
  // Disconnect from VPN
  disconnectVpn: async (): Promise<{ success: boolean; message: string }> => {
    const response = await http.post('/api/vpn/disconnect');
    return response.data;
  },
  
  // Get VPN status
  getStatus: async (): Promise<{ connected: boolean; server?: string; since?: string }> => {
    const response = await http.get('/api/vpn/status');
    return response.data;
  },
};

export const appsApi = {
  // Get installed applications
  getInstalledApps: async () => {
    const response = await http.get('/api/apps');
    return response.data;
  },
  // Get running applications
  getRunningApps: async () => {
    const response = await http.get('/api/apps/running');
    return response.data;
  },
  // Get app resource usage
  getAppResourceUsage: async (appName: string) => {
    const response = await http.get(`/api/apps/resource-usage/${encodeURIComponent(appName)}`);
    return response.data;
  },
  // Scan installed apps for threats
  scanThreats: async () => {
    const response = await http.get('/api/apps/scan-threats');
    return response.data;
  },
};

// Export all API modules with consistent naming
const api = {
  // For backward compatibility
  scan: scanApi,
  device: deviceApi,
  sos: sosApi,
  vpn: vpnApi,
  
  // New naming convention
  scanApi,
  deviceApi,
  sosApi,
  vpnApi,
  
  // HTTP client for direct use if needed
  http,
  appsApi,
} as const;

export default api;
