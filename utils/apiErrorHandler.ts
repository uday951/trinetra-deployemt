export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number = 500, data: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

export const handleApiError = (error: any): never => {
  // Handle Axios errors
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;
    const message = data?.message || error.message || 'An unknown error occurred';
    throw new ApiError(message, status, data);
  } else if (error.request) {
    // The request was made but no response was received
    throw new ApiError('No response received from server. Please check your connection.', 0);
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new ApiError(error.message || 'An unknown error occurred');
  }
};

export const isApiError = (error: any): error is ApiError => {
  return error?.name === 'ApiError';
};

export const getErrorMessage = (error: any, defaultMessage: string = 'An error occurred'): string => {
  if (!error) return defaultMessage;
  
  if (typeof error === 'string') return error;
  
  if (error.message) return error.message;
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.statusText) {
    return error.response.statusText;
  }
  
  return defaultMessage;
};
