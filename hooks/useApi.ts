import { useState, useCallback } from 'react';
import api from '../services/api';

type ApiFunction<T, P extends any[]> = (...args: P) => Promise<T>;

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi<T, P extends any[]>(
  apiFunction: ApiFunction<T, P>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const execute = useCallback(
    async (...args: P) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await apiFunction(...args);
        setData(result);
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(error);
        if (options.onError) {
          options.onError(error);
        }
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, options]
  );

  return { execute, data, error, isLoading };
}

// Specific API hooks for common operations
export function useFileScan() {
  return useApi(api.scanApi.scanFile);
}

export function useUrlScan() {
  return useApi(api.scanApi.scanUrl);
}

export function useIpScan() {
  return useApi(api.scanApi.scanIp);
}

export function useDeviceInfo() {
  return useApi(api.deviceApi.getDeviceInfo);
}

export function useSos() {
  return useApi(api.sosApi.sendSos);
}
