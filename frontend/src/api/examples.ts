/**
 * Example usage of the generated API client and file service
 * 
 * This file demonstrates how to use the automatically generated
 * TypeScript client from the backend Swagger specification.
 */

import { 
  FileService,
  uploadFile,
  getAllFiles,
  getFileContent,
  deleteFile,
  validateFile,
  formatFileSize,
  type FileResponse,
  type FileListResponse
} from './index';
import {
  GetAllFilesParamsSortByEnum,
  GetAllFilesParamsSortOrderEnum
} from './generated/api-client';

/**
 * Example: File upload from file input
 */
export const handleFileUpload = async (file: File): Promise<FileResponse> => {
  // Validate file before upload
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Upload file using the service
  const uploadedFile = await uploadFile(file);
  
  console.log(`File "${uploadedFile.filename}" uploaded successfully!`);
  console.log(`File ID: ${uploadedFile.id}`);
  console.log(`Size: ${uploadedFile.formattedSize}`);
  
  return uploadedFile;
};

/**
 * Example: Upload text content directly
 */
export const createTextFile = async (filename: string, content: string): Promise<FileResponse> => {
  const uploadedFile = await FileService.uploadTextFile(filename, content);
  
  console.log(`Text file "${uploadedFile.filename}" created successfully!`);
  return uploadedFile;
};

/**
 * Example: Get all files with pagination and sorting
 */
export const listFiles = async (
  page: number = 1, 
  limit: number = 20,
  sortBy: GetAllFilesParamsSortByEnum = GetAllFilesParamsSortByEnum.CreatedAt,
  sortOrder: GetAllFilesParamsSortOrderEnum = GetAllFilesParamsSortOrderEnum.DESC
): Promise<FileListResponse> => {
  const response = await getAllFiles({
    page,
    limit,
    sortBy,
    sortOrder
  });

  console.log(`Found ${response.totalCount} files (showing ${response.files.length})`);
  console.log(`Total storage used: ${formatFileSize(response.totalSize)}`);
  
  response.files.forEach(file => {
    console.log(`- ${file.filename} (${file.formattedSize}) - ${file.createdAt}`);
  });

  return response;
};

/**
 * Example: Get file content for editing/viewing
 */
export const viewFile = async (fileId: string) => {
  const file = await getFileContent(fileId);
  
  console.log(`File: ${file.filename}`);
  console.log(`Type: ${file.contentType}`);
  console.log(`Size: ${file.formattedSize}`);
  console.log(`Content:\n${file.content}`);
  
  return file;
};

/**
 * Example: Download file to user's computer
 */
export const downloadFile = async (fileId: string) => {
  try {
    await FileService.triggerDownload(fileId);
    console.log('Download started...');
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

/**
 * Example: Delete a file
 */
export const removeFile = async (fileId: string) => {
  const result = await deleteFile(fileId);
  
  if (result.deleted) {
    console.log(`File "${result.filename}" deleted successfully!`);
  } else {
    console.error(`Failed to delete file: ${result.message}`);
  }
  
  return result;
};

/**
 * Example React component using the file API
 */
export const exampleReactComponentCode = `
import React, { useState, useEffect } from 'react';
import { 
  uploadFile, 
  getAllFiles, 
  deleteFile, 
  validateFile,
  type FileResponse 
} from '../api';

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Load files on component mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await getAllFiles();
      setFiles(response.files);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      await uploadFile(file);
      await loadFiles(); // Refresh file list
      alert('File uploaded successfully!');
    } catch (error) {
      alert(\`Upload failed: \${error.message}\`);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      await loadFiles(); // Refresh file list
    } catch (error) {
      alert(\`Delete failed: \${error.message}\`);
    }
  };

  return (
    <div>
      <h2>File Manager</h2>
      
      <input 
        type="file" 
        accept=".txt,.md,.json"
        onChange={handleFileUpload}
      />
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {files.map(file => (
            <li key={file.id}>
              {file.filename} ({file.formattedSize})
              <button onClick={() => handleDelete(file.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileManager;
`;

// Export for easy testing in browser console
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).fileApiExamples = {
    handleFileUpload,
    createTextFile,
    listFiles,
    viewFile,
    downloadFile,
    removeFile
  };
}