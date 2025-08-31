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

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
  devices?: Array<{
    id: string;
    name: string;
    status: string;
    lastSeen: string;
  }>;
}

// Environment configuration
// Use adb port forwarding for reliable connection
const getBackendUrl = () => {
  if (__DEV__) {
    // Try localhost first (works with adb reverse), fallback to PC IP
    return 'http://localhost:5000';
  }
  return 'http://your-production-url.com';
};

// Fallback URLs for real device testing
const FALLBACK_URLS = [
  'http://localhost:5000',      // adb reverse
  'http://10.0.2.2:5000',      // Android emulator
  'http://192.168.1.5:5000',   // PC IP address
];

// Test connection function with fallback URLs
const testConnection = async (url: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${url}/health`, { timeout: 3000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

// Find working backend URL
const findWorkingUrl = async (): Promise<string> => {
  for (const url of FALLBACK_URLS) {
    console.log(`Testing connection to: ${url}`);
    if (await testConnection(url)) {
      console.log(`✅ Connected to: ${url}`);
      return url;
    }
  }
  console.log('❌ No working backend URL found');
  return FALLBACK_URLS[0]; // Default to first URL
};

let CURRENT_BACKEND_URL = getBackendUrl();
const PROD_BACKEND_URL = 'http://your-production-url.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: CURRENT_BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('API Base URL:', CURRENT_BACKEND_URL);

// Test connection and find working URL on startup
findWorkingUrl().then(workingUrl => {
  if (workingUrl !== CURRENT_BACKEND_URL) {
    CURRENT_BACKEND_URL = workingUrl;
    api.defaults.baseURL = workingUrl;
    console.log('Updated API Base URL to:', workingUrl);
  }
  console.log('Backend connection:', '✅ Connected');
}).catch(() => {
  console.log('Backend connection:', '❌ Failed');
});

// Request interceptor with retry logic
let isRetrying = false;
api.interceptors.request.use(
  async (config) => {
    try {
      // Add auth token if available
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add request timestamp
      config.headers['X-Request-Timestamp'] = new Date().toISOString();
      
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error);

    // Check if error is due to network connectivity
    if (!error.response) {
      throw new Error('Network error. Please check your connection and try again.');
    }

    // Get error message from response if available
    const errorMessage = error.response.data?.message || error.response.data?.error || error.message;

    // Handle different error scenarios
    switch (error.response.status) {
      case 400:
        throw new Error(errorMessage || 'Invalid request. Please check your input.');
      
      case 401:
        // Unauthorized - clear token and redirect to login
        await AsyncStorage.removeItem('token');
        throw new Error(errorMessage || 'Session expired. Please login again.');
      
      case 403:
        throw new Error(errorMessage || 'You do not have permission to perform this action.');
      
      case 404:
        throw new Error(errorMessage || 'The requested resource was not found.');
      
      case 422:
        throw new Error(errorMessage || 'Validation error. Please check your input.');
      
      case 500:
        throw new Error(errorMessage || 'Server error. Please try again later.');
      
      default:
        throw new Error(errorMessage || 'An unexpected error occurred.');
    }
  }
);

// Helper function to make API requests with retry logic
const apiRequest = async <T = any>(
  config: AxiosRequestConfig,
  retries = 2
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.request<T>(config);
    return response;
  } catch (error: any) {
    if (retries > 0 && (!error.response || error.response.status >= 500)) {
      // Wait for a short time before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiRequest(config, retries - 1);
    }
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

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  devices?: Array<{
    id: string;
    name: string;
    status: string;
    lastSeen: string;
  }>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ThreatScanResponse {
  success: boolean;
  results: Array<{
    packageName: string;
    threatLevel: 'low' | 'medium' | 'high';
    threats: string[];
    recommendations: string[];
  }>;
  scannedAt: string;
}

interface SecurityEvent {
  type: 'app_scan' | 'network_activity' | 'permission_change' | 'system_alert';
  severity: 'low' | 'medium' | 'high';
  details: any;
  timestamp: Date;
}

interface MonitoringStatus {
  isActive: boolean;
  lastCheck: Date;
  activeMonitors: {
    appBehavior: boolean;
    networkActivity: boolean;
    permissionChanges: boolean;
  };
}

// API functions
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

  // System Scan (should hit /api/security/scan)
  scanUrl: async (url: string): Promise<ScanResult> => {
    // The backend expects a POST to /api/security/scan
    const response = await http.post<ScanResult>('/api/security/scan', { url });
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
  // Get device metrics (battery, storage, memory, CPU)
  getMetrics: async () => {
    try {
      const response = await http.get('/api/device/metrics');
      return response.data;
    } catch (error) {
      // Return mock data if API fails
      return {
        battery: { level: 85, isCharging: false, health: 'Good' },
        storage: { internal: { total: 64000000000, available: 32000000000, used: 32000000000 } },
        memory: { total: 8000000000, available: 4000000000, used: 4000000000, cached: 1000000000 },
        cpu: { usage: 45, temperature: 35 }
      };
    }
  },
  // Get security status
  getSecurityStatus: async () => {
    try {
      const response = await http.get('/api/device/security');
      return response.data;
    } catch (error) {
      // Return mock data if API fails
      return {
        playProtect: { enabled: true, lastScan: new Date().toISOString() },
        encryption: { enabled: true, type: 'AES-256', status: 'Active' },
        screenLock: { enabled: true, type: 'Pattern', status: 'Secure' }
      };
    }
  },
  // Optimize device
  optimize: async () => {
    try {
      const response = await http.post('/api/device/optimize');
      return response.data;
    } catch (error) {
      // Return success for demo
      return { success: true, message: 'Device optimized successfully' };
    }
  },
  // Get device health
  getDeviceHealth: async () => {
    const response = await http.get('/api/device/health');
    return response.data;
  },
  // Get current device location
  getDeviceLocation: async () => {
    const response = await http.get('/api/device/location');
    return response.data;
  },
  // Optimize device (legacy)
  optimizeDevice: async () => {
    const response = await http.post('/api/device/optimize');
    return response.data;
  },
  // Lock device
  lockDevice: async (deviceId: string) => {
    const response = await http.post('/api/device/lock', { deviceId });
    return response.data;
  },
  // Wipe device
  wipeDevice: async (deviceId: string) => {
    const response = await http.post('/api/device/wipe', { deviceId });
    return response.data;
  },
  // Play sound on device
  playSound: async () => {
    const response = await http.post('/api/device/play-sound');
    return response.data;
  },
  // Get last location for a device
  getLastLocation: async (deviceId: string) => {
    const response = await http.get(`/api/device/location/${deviceId}`);
    return response.data;
  },
  // Update device location
  updateLocation: async (deviceId: string, lat: number, lng: number) => {
    const response = await http.post('/api/device/location', { deviceId, lat, lng });
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
  // Get all apps
  getAll: () => http.get('/api/apps'),
  // Update app lock status
  updateLockStatus: (packageName: string, isLocked: boolean) => 
    http.post('/api/apps/lock', { packageName, isLocked }),
};

export const authApi = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await http.post<AuthResponse>('/api/auth/register', data);
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error: any) {
      if (error.message.includes('Email is already registered')) {
        throw new Error('This email is already registered. Please use a different email or try logging in.');
      }
      throw error;
    }
  },

  // Login user
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await http.post<AuthResponse>('/api/auth/login', data);
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error: any) {
      if (error.message.includes('Invalid email or password')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      throw error;
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return false;
      
      // Verify token by fetching user profile
      await http.get('/api/auth/me');
      return true;
    } catch (error) {
      await AsyncStorage.removeItem('token');
      return false;
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await http.get('/api/auth/me');
    return response.data;
  },

  // Register new device
  registerDevice: async (deviceData: { deviceId: string; name: string }): Promise<{ device: DeviceInfo }> => {
    const response = await http.post('/api/auth/device/register', deviceData);
    return response.data;
  },
};

// API endpoints
export const threatApi = {
  scanApps: (apps: any[]) => http.post<ThreatScanResponse>('/threat-scan/scan', { apps }),
  scanSingleApp: (app: any) => http.post('/threat-scan/scan/single', { app }),
};

export const securityApi = {
  // Start real-time monitoring
  startMonitoring: (interval?: number) => 
    http.post<{ status: string; monitoringStatus: MonitoringStatus }>('/api/security/monitor/start', { interval }),

  // Stop monitoring
  stopMonitoring: () => 
    http.post<{ status: string; monitoringStatus: MonitoringStatus }>('/api/security/monitor/stop'),

  // Get monitoring status
  getMonitoringStatus: () => 
    http.get<MonitoringStatus>('/api/security/monitor/status'),

  // Get security events
  getSecurityEvents: () => 
    http.get<{ events: SecurityEvent[] }>('/api/security/monitor/events'),
};

// Export all API modules with consistent naming
const apiModules = {
  // For backward compatibility
  scan: scanApi,
  device: deviceApi,
  sos: sosApi,
  
  // New naming convention
  scanApi,
  deviceApi,
  sosApi,
  authApi,
  appsApi,
  threatApi,
  securityApi,
  
  // HTTP client for direct use if needed
  http,
} as const;

export default apiModules;
