import { filesApi } from './index';
import type { 
  FileResponse, 
  FileListResponse, 
  FileContentResponse, 
  DeleteFileResponse,
  GetAllFilesParamsSortByEnum,
  GetAllFilesParamsSortOrderEnum
} from './generated/api-client';

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

/**
 * File service providing high-level file operations
 * Wraps the generated API client with convenient methods
 */
export class FileService {
  /**
   * Upload a file from File object (for file input)
   */
  static async uploadFile(file: File): Promise<FileResponse> {
    try {
      const content = await this.readFileAsText(file);
      
      const response = await filesApi.uploadFile({
        filename: file.name,
        content,
        contentType: file.type || this.getContentTypeFromFilename(file.name)
      });

      return response.data;
    } catch (error: unknown) {
      throw new Error(`File upload failed: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Upload a file from text content
   */
  static async uploadTextFile(filename: string, content: string, contentType?: string): Promise<FileResponse> {
    try {
      const response = await filesApi.uploadFile({
        filename,
        content,
        contentType: contentType || this.getContentTypeFromFilename(filename)
      });

      return response.data;
    } catch (error: unknown) {
      throw new Error(`File upload failed: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Get all files with pagination and sorting
   */
  static async getAllFiles(options?: {
    page?: number;
    limit?: number;
    sortBy?: GetAllFilesParamsSortByEnum;
    sortOrder?: GetAllFilesParamsSortOrderEnum;
  }): Promise<FileListResponse> {
    try {
      const response = await filesApi.getAllFiles(options);
      return response.data;
    } catch (error: unknown) {
      throw new Error(`Failed to fetch files: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Get file content by ID
   */
  static async getFileContent(fileId: string): Promise<FileContentResponse> {
    try {
      const response = await filesApi.getFileContent(fileId);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 404) {
        throw new Error('File not found');
      }
      throw new Error(`Failed to fetch file: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Delete a file by ID
   */
  static async deleteFile(fileId: string): Promise<DeleteFileResponse> {
    try {
      const response = await filesApi.deleteFile(fileId);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 404) {
        throw new Error('File not found');
      }
      throw new Error(`Failed to delete file: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Download file content as blob (for browser download)
   */
  static async downloadFile(fileId: string): Promise<{ blob: Blob; filename: string }> {
    try {
      const fileData = await this.getFileContent(fileId);
      
      const blob = new Blob([fileData.content], { 
        type: fileData.contentType 
      });

      return {
        blob,
        filename: fileData.filename
      };
    } catch (error: unknown) {
      throw new Error(`Failed to download file: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Trigger browser download of a file
   */
  static async triggerDownload(fileId: string): Promise<void> {
    try {
      const { blob, filename } = await this.downloadFile(fileId);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: unknown) {
      throw new Error(`Failed to download file: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 1048576; // 1MB
    const allowedTypes = ['text/plain', 'text/markdown', 'application/json'];
    const allowedExtensions = ['.txt', '.md', '.json'];

    // Check file size
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File too large. Maximum size is ${this.formatFileSize(maxSize)}` 
      };
    }

    // Check file extension
    const extension = this.getFileExtension(file.name).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return { 
        valid: false, 
        error: `Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed` 
      };
    }

    // Check MIME type if available
    if (file.type && !allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Invalid content type. Only ${allowedTypes.join(', ')} are allowed` 
      };
    }

    return { valid: true };
  }

  /**
   * Format file size in human-readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Extract error message from unknown error
   */
  private static getErrorMessage(error: unknown): string {
    const apiError = error as ApiError;
    
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'Unknown error occurred';
  }

  /**
   * Get file extension from filename
   */
  private static getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.')) || '';
  }

  /**
   * Get content type from filename
   */
  private static getContentTypeFromFilename(filename: string): string {
    const extension = this.getFileExtension(filename).toLowerCase();
    
    switch (extension) {
      case '.txt':
        return 'text/plain';
      case '.md':
        return 'text/markdown';
      case '.json':
        return 'application/json';
      default:
        return 'text/plain';
    }
  }

  /**
   * Read file as text content
   */
  private static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }
}

// Export convenience methods for easier importing
export const {
  uploadFile,
  uploadTextFile,
  getAllFiles,
  getFileContent,
  deleteFile,
  downloadFile,
  triggerDownload,
  validateFile,
  formatFileSize
} = FileService;