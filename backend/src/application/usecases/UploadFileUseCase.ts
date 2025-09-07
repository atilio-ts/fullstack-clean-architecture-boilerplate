import { v4 as uuidv4 } from 'uuid';
import { IUseCase } from './IUseCase';
import { IFileRepository } from '../../domain/repositories';
import { File } from '../../domain/entities';
import { FileName, FileSize } from '../../domain/valueobjects';
import { FileStorageService } from '../../infrastructure/services';

/**
 * Request model for file upload
 */
export interface UploadFileRequest {
  filename: string;
  content: string;
  contentType?: string;
}

/**
 * Response model for file upload
 */
export interface UploadFileResponse {
  id: string;
  filename: string;
  fileSize: number;
  contentType: string;
  createdAt: Date;
}

/**
 * Use case for uploading a new file to the system
 * Handles validation, storage, and database persistence
 */
export class UploadFileUseCase implements IUseCase<UploadFileRequest, UploadFileResponse> {
  constructor(
    private fileRepository: IFileRepository,
    private fileStorageService: FileStorageService
  ) {}

  async execute(request: UploadFileRequest): Promise<UploadFileResponse> {
    // Validate input
    this.validateRequest(request);

    // Create value objects for validation
    const fileName = FileName.create(request.filename);
    const contentSize = Buffer.byteLength(request.content, 'utf8');
    const fileSize = FileSize.create(contentSize);

    // Determine content type
    const contentType = request.contentType || this.fileStorageService.getContentType(request.filename);

    // Validate content matches content type
    if (!this.fileStorageService.validateFileContent(request.content, contentType)) {
      throw new Error(`File content is not valid for content type: ${contentType}`);
    }

    // Check if filename already exists
    const existingFile = await this.fileRepository.findByFilename(request.filename);
    if (existingFile) {
      throw new Error(`A file with the name '${request.filename}' already exists`);
    }

    try {
      // Store file content to disk
      const filePath = await this.fileStorageService.storeFile(request.content, request.filename);

      // Create file entity
      const fileId = uuidv4();
      const file = File.create(
        fileId,
        fileName.value,
        filePath,
        fileSize.value,
        contentType
      );

      // Save to database
      const savedFile = await this.fileRepository.save(file);

      // Return response
      return {
        id: savedFile.id,
        filename: savedFile.filename,
        fileSize: savedFile.fileSize,
        contentType: savedFile.contentType,
        createdAt: savedFile.createdAt
      };
    } catch (error) {
      // If database save fails, cleanup the stored file
      throw new Error(`Failed to upload file: ${(error as Error).message}`);
    }
  }

  /**
   * Validates the upload request
   */
  private validateRequest(request: UploadFileRequest): void {
    if (!request) {
      throw new Error('Upload request is required');
    }

    if (!request.filename || request.filename.trim().length === 0) {
      throw new Error('Filename is required');
    }

    if (typeof request.content !== 'string') {
      throw new Error('File content must be a string');
    }

    if (request.content.length === 0) {
      throw new Error('File content cannot be empty');
    }

    // Additional content type validation if provided
    if (request.contentType) {
      const allowedTypes = File.ALLOWED_CONTENT_TYPES;
      if (!allowedTypes.includes(request.contentType as any)) {
        throw new Error(`Content type must be one of: ${allowedTypes.join(', ')}`);
      }
    }
  }
}