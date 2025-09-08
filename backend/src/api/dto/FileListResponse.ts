import { FileResponse } from './FileResponse';

/**
 * Data Transfer Object for paginated file list responses
 * Used for API responses that return multiple files with pagination info
 */
export interface FileListResponse {
  /** Array of file metadata objects */
  files: FileResponse[];
  
  /** Total number of files in the system */
  totalCount: number;
  
  /** Total size of all files in bytes */
  totalSize: number;
  
  /** Current page number (1-based) */
  page: number;
  
  /** Number of items per page */
  limit: number;
  
  /** Whether there is a next page available */
  hasNextPage: boolean;
  
  /** Whether there is a previous page available */
  hasPreviousPage: boolean;
}