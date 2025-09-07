/**
 * Data Transfer Object for file responses
 * Used for API responses containing file metadata
 */
export interface FileResponse {
  /** Unique identifier for the file */
  id: string;
  
  /** Original filename with extension */
  filename: string;
  
  /** File size in bytes */
  fileSize: number;
  
  /** Human-readable file size (e.g., "1.5 MB", "256 KB") */
  formattedSize: string;
  
  /** MIME content type of the file */
  contentType: string;
  
  /** When the file was uploaded */
  createdAt: string;
  
  /** When the file was last modified */
  updatedAt: string;
}