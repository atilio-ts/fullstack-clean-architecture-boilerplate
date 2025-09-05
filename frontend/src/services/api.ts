import axios from 'axios';
import type { ApiResponse } from '@/types';

const API_BASE_URL = import.meta.env.BACKEND_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await apiClient.get(url);
    return response.data;
  },

  post: async <T>(url: string, data: any): Promise<ApiResponse<T>> => {
    const response = await apiClient.post(url, data);
    return response.data;
  },

  put: async <T>(url: string, data: any): Promise<ApiResponse<T>> => {
    const response = await apiClient.put(url, data);
    return response.data;
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await apiClient.delete(url);
    return response.data;
  },
};