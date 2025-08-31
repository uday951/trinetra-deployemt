import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { Alert } from 'react-native';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  registerDevice: (deviceId: string, name: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuth = await api.authApi.isAuthenticated();
      setIsAuthenticated(isAuth);
      if (isAuth) {
        const response = await api.authApi.getCurrentUser();
        setUser(response.user);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.authApi.login({ email, password });
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const response = await api.authApi.register({ email, password, name });
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again with different credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await api.authApi.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error: any) {
      Alert.alert('Logout Failed', error.message || 'Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerDevice = async (deviceId: string, name: string) => {
    try {
      setIsLoading(true);
      await api.authApi.registerDevice({ deviceId, name });
    } catch (error: any) {
      Alert.alert('Device Registration Failed', error.message || 'Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await api.http.put('/api/profile', data);
      setUser(prev => prev ? { ...prev, ...response.data } : response.data);
    } catch (error: any) {
      Alert.alert('Profile Update Failed', error.message || 'Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await api.authApi.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        registerDevice,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 