import { Api } from './generated/api-client';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

// Create API client instance with interceptors
export const apiClient = new Api({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

// Export types for use throughout the app
export type { 
  HealthResponse,
  FileResponse,
  FileListResponse,
  FileContentResponse,
  DeleteFileResponse,
  ProcessedFileRequest,
  GetAllFilesParamsSortByEnum,
  GetAllFilesParamsSortOrderEnum
} from './generated/api-client';

// Export the Api class for advanced use cases
export { Api } from './generated/api-client';

// Export specific API endpoints for easier importing
export const healthApi = apiClient.health;
export const filesApi = apiClient.files;

// Health check utility function
export const checkHealth = async () => {
  try {
    const response = await healthApi.getHealth();
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

// Export file service and utilities
export { FileService } from './fileService';
export {
  uploadFile,
  uploadTextFile,
  getAllFiles,
  getFileContent,
  deleteFile,
  downloadFile,
  triggerDownload,
  validateFile,
  formatFileSize
} from './fileService';