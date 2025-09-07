/**
 * Data Transfer Object for processed file upload requests
 * Used internally after multer processes the multipart form data
 */
export interface ProcessedFileRequest {
  /** Original filename with extension */
  filename: string;
  
  /** File content as string */
  content: string;
  
  /** MIME content type */
  contentType: string;
}