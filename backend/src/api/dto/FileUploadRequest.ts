/**
 * Data Transfer Object for file upload requests
 * Used for multipart form data file uploads
 */
export interface FileUploadRequest {
  /** The uploaded file (handled by multer middleware) */
  file?: Express.Multer.File;
  
  /** Processed file data (added by validation middleware) */
  processedFile?: {
    filename: string;
    content: string;
    size: number;
    contentType: string;
  };
}