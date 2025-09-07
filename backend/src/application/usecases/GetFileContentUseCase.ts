import { IUseCase } from './IUseCase';
import { IFileRepository } from '../../domain/repositories';
import { FileStorageService } from '../../infrastructure/services';

/**
 * Request model for getting file content
 */
export interface GetFileContentRequest {
  fileId: string;
}

/**
 * Response model for file content
 */
export interface GetFileContentResponse {
  id: string;
  filename: string;
  content: string;
  fileSize: number;
  formattedSize: string;
  contentType: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Use case for retrieving file content by ID
 * Returns complete file information including content
 */
export class GetFileContentUseCase implements IUseCase<GetFileContentRequest, GetFileContentResponse> {
  constructor(
    private fileRepository: IFileRepository,
    private fileStorageService: FileStorageService
  ) {}

  async execute(request: GetFileContentRequest): Promise<GetFileContentResponse> {
    // Validate request
    this.validateRequest(request);

    // Find file in database
    const file = await this.fileRepository.findById(request.fileId);
    if (!file) {
      throw new Error(`File with ID '${request.fileId}' not found`);
    }

    try {
      // Read file content from disk
      const content = await this.fileStorageService.readFile(file.filePath);

      // Validate that the file still exists and content is valid
      if (!this.fileStorageService.validateFileContent(content, file.contentType)) {
        throw new Error('File content appears to be corrupted or invalid');
      }

      return {
        id: file.id,
        filename: file.filename,
        content,
        fileSize: file.fileSize,
        formattedSize: file.getFormattedSize(),
        contentType: file.contentType,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      };
    } catch (error) {
      // If file doesn't exist on disk but exists in database, we have an inconsistency
      if ((error as Error).message.includes('File not found')) {
        throw new Error(`File '${file.filename}' exists in database but not on disk. This indicates data corruption.`);
      }
      throw error;
    }
  }

  /**
   * Validates the request
   */
  private validateRequest(request: GetFileContentRequest): void {
    if (!request) {
      throw new Error('Request is required');
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