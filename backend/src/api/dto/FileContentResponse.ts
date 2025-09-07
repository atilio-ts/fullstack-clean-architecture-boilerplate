/**
 * Data Transfer Object for file content responses
 * Used when returning complete file data including content
 */
export interface FileContentResponse {
  /** Unique identifier for the file */
  id: string;
  
  /** Original filename with extension */
  filename: string;
  
  /** Complete file content as string */
  content: string;
  
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