import { IUseCase } from './IUseCase';
import { IFileRepository } from '../../domain/repositories';
import { FileStorageService } from '../../infrastructure/services';

/**
 * Request model for deleting a file
 */
export interface DeleteFileRequest {
  fileId: string;
}

/**
 * Response model for file deletion
 */
export interface DeleteFileResponse {
  id: string;
  filename: string;
  deleted: boolean;
  message: string;
}

/**
 * Use case for deleting a file from both database and disk storage
 * Ensures complete cleanup of file resources
 */
export class DeleteFileUseCase implements IUseCase<DeleteFileRequest, DeleteFileResponse> {
  constructor(
    private fileRepository: IFileRepository,
    private fileStorageService: FileStorageService
  ) {}

  async execute(request: DeleteFileRequest): Promise<DeleteFileResponse> {
    // Validate request
    this.validateRequest(request);

    // Find file in database
    const file = await this.fileRepository.findById(request.fileId);
    if (!file) {
      throw new Error(`File with ID '${request.fileId}' not found`);
    }

    const filename = file.filename;
    const filePath = file.filePath;

    try {
      // Delete from database first
      await this.fileRepository.delete(request.fileId);

      // Then delete from disk
      await this.fileStorageService.deleteFile(filePath);

      return {
        id: request.fileId,
        filename,
        deleted: true,
        message: `File '${filename}' has been successfully deleted`
      };
    } catch (error) {
      // If database deletion succeeded but file deletion failed,
      // we should log this as it creates an orphaned file
      const errorMessage = (error as Error).message;
      
      // Try to restore database record if disk deletion failed
      try {
        await this.fileRepository.save(file);
      } catch (restoreError) {
        // Log this critical error - we now have inconsistent state
        throw new Error(
          `Critical error: Failed to delete file '${filename}' from disk after removing from database. ` +
          `Attempted to restore database record but failed: ${(restoreError as Error).message}. ` +
          `Original error: ${errorMessage}`
        );
      }

      throw new Error(`Failed to delete file '${filename}': ${errorMessage}`);
    }
  }

  /**
   * Validates the delete request
   */
  private validateRequest(request: DeleteFileRequest): void {
    if (!request) {
      throw new Error('Delete request is required');
    }

    if (!request.fileId || request.fileId.trim().length === 0) {
      throw new Error('File ID is required');
    }

    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(request.fileId)) {
      throw new Error('File ID must be a valid UUID');
    }
  }
}