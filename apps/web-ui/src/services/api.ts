import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@/types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle errors
    if (error.response) {
      // Server responded with error
      const apiError = error.response.data;

      // Handle 401 Unauthorized
      // Note: We no longer auto-redirect on 401 to allow demo mode with hardcoded credentials
      // Individual pages should handle auth errors as needed
      if (error.response.status === 401) {
        console.warn('API returned 401 Unauthorized:', apiError);
      }

      return Promise.reject(apiError);
    } else if (error.request) {
      // Request was made but no response
      return Promise.reject({
        success: false,
        error: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
      } as ApiError);
    } else {
      // Something else happened
      return Promise.reject({
        success: false,
        error: 'Request Error',
        message: error.message,
      } as ApiError);
    }
  }
);

export default api;
