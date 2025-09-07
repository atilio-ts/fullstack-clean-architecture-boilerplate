/**
 * Data Transfer Object for file deletion responses
 * Used when confirming successful file deletion
 */
export interface DeleteFileResponse {
  /** ID of the deleted file */
  id: string;
  
  /** Name of the deleted file */
  filename: string;
  
  /** Whether the deletion was successful */
  deleted: boolean;
  
  /** Success or error message */
  message: string;
}