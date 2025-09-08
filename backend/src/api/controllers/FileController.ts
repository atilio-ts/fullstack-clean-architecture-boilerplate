import { 
  Route, 
  Get, 
  Post, 
  Delete,
  Tags, 
  SuccessResponse, 
  Example, 
  Controller, 
  Path,
  Query,
  Response,
  Body
} from 'tsoa';
import { 
  FileResponse,
  FileContentResponse,
  FileListResponse,
  DeleteFileResponse,
  ProcessedFileRequest
} from '../dto';
import {
  UploadFileUseCase,
  GetAllFilesUseCase,
  GetFileContentUseCase,
  DeleteFileUseCase
} from '../../application/usecases';

@Route('files')
@Tags('Files')
export class FileController extends Controller {
  constructor(
    private uploadFileUseCase: UploadFileUseCase,
    private getAllFilesUseCase: GetAllFilesUseCase,
    private getFileContentUseCase: GetFileContentUseCase,
    private deleteFileUseCase: DeleteFileUseCase
  ) {
    super();
  }

  /**
   * Upload a new file to the system
   * @summary Upload a text document (txt, md, json only) using multipart form data
   * @description Upload a file using multipart/form-data with field name 'file'. Supports .txt, .md, and .json files up to 1MB.
   */
  @Post('upload')
  @SuccessResponse('201', 'File uploaded successfully')
  @Response('400', 'Invalid file format, content, or missing file')
  @Response('409', 'File with same name already exists')
  @Response('413', 'File too large (max 1MB)')
  @Example<FileResponse>({
    id: '123e4567-e89b-12d3-a456-426614174000',
    filename: 'example.txt',
    fileSize: 1024,
    formattedSize: '1.0 KB',
    contentType: 'text/plain',
    createdAt: '2025-09-06T10:30:00.000Z',
    updatedAt: '2025-09-06T10:30:00.000Z'
  })
  public async uploadFile(@Body() processedFile: ProcessedFileRequest): Promise<FileResponse> {
    try {
      if (!processedFile) {
        this.setStatus(400);
        throw new Error('No valid file data found. Please ensure file is uploaded via multipart form data with field name "file"');
      }

      const uploadRequest = {
        filename: processedFile.filename,
        content: processedFile.content,
        contentType: processedFile.contentType
      };

      const result = await this.uploadFileUseCase.execute(uploadRequest);
      
      this.setStatus(201);
      return {
        id: result.id,
        filename: result.filename,
        fileSize: result.fileSize,
        formattedSize: this.formatFileSize(result.fileSize),
        contentType: result.contentType,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.createdAt.toISOString()
      };
    } catch (error) {
      const message = (error as Error).message;
      
      if (message.includes('already exists')) {
        this.setStatus(409);
        throw new Error(message);
      }
      
      if (message.includes('cannot exceed') || message.includes('too large')) {
        this.setStatus(413);
        throw new Error(message);
      }
      
      if (message.includes('extension') || message.includes('content type') || message.includes('invalid') || message.includes('No valid file')) {
        this.setStatus(400);
        throw new Error(message);
      }
      
      this.setStatus(500);
      throw new Error(`Failed to upload file: ${message}`);
    }
  }

  /**
   * Get all files with optional pagination
   * @summary Retrieve list of all uploaded files
   */
  @Get()
  @SuccessResponse('200', 'Files retrieved successfully')
  @Example<FileListResponse>({
    files: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        filename: 'example.txt',
        fileSize: 1024,
        formattedSize: '1.0 KB',
        contentType: 'text/plain',
        createdAt: '2025-09-06T10:30:00.000Z',
        updatedAt: '2025-09-06T10:30:00.000Z'
      }
    ],
    totalCount: 1,
    totalSize: 1024,
    page: 1,
    limit: 20,
    hasNextPage: false,
    hasPreviousPage: false
  })
  public async getAllFiles(
    @Query() page?: number,
    @Query() limit?: number,
    @Query() sortBy?: 'filename' | 'created_at' | 'file_size',
    @Query() sortOrder?: 'ASC' | 'DESC'
  ): Promise<FileListResponse> {
    try {
      const result = await this.getAllFilesUseCase.execute({
        page,
        limit,
        sortBy,
        sortOrder
      });

      return {
        files: result.files.map(file => ({
          id: file.id,
          filename: file.filename,
          fileSize: file.fileSize,
          formattedSize: file.formattedSize,
          contentType: file.contentType,
          createdAt: file.createdAt.toISOString(),
          updatedAt: file.updatedAt.toISOString()
        })),
        totalCount: result.totalCount,
        totalSize: result.totalSize,
        page: result.page,
        limit: result.limit,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage
      };
    } catch (error) {
      this.setStatus(500);
      throw new Error(`Failed to retrieve files: ${(error as Error).message}`);
    }
  }

  /**
   * Get file details and content by ID
   * @summary Retrieve complete file information including content
   */
  @Get('{fileId}')
  @SuccessResponse('200', 'File retrieved successfully')
  @Response('404', 'File not found')
  @Example<FileContentResponse>({
    id: '123e4567-e89b-12d3-a456-426614174000',
    filename: 'example.txt',
    content: 'This is the file content...',
    fileSize: 1024,
    formattedSize: '1.0 KB',
    contentType: 'text/plain',
    createdAt: '2025-09-06T10:30:00.000Z',
    updatedAt: '2025-09-06T10:30:00.000Z'
  })
  public async getFileContent(@Path() fileId: string): Promise<FileContentResponse> {
    try {
      const result = await this.getFileContentUseCase.execute({ fileId });

      return {
        id: result.id,
        filename: result.filename,
        content: result.content,
        fileSize: result.fileSize,
        formattedSize: result.formattedSize,
        contentType: result.contentType,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString()
      };
    } catch (error) {
      const message = (error as Error).message;
      
      if (message.includes('not found')) {
        this.setStatus(404);
        throw new Error(message);
      }
      
      if (message.includes('UUID')) {
        this.setStatus(400);
        throw new Error(message);
      }
      
      this.setStatus(500);
      throw new Error(`Failed to retrieve file: ${message}`);
    }
  }

  /**
   * Delete a file by ID
   * @summary Remove a file from the system
   */
  @Delete('{fileId}')
  @SuccessResponse('200', 'File deleted successfully')
  @Response('404', 'File not found')
  @Example<DeleteFileResponse>({
    id: '123e4567-e89b-12d3-a456-426614174000',
    filename: 'example.txt',
    deleted: true,
    message: "File 'example.txt' has been successfully deleted"
  })
  public async deleteFile(@Path() fileId: string): Promise<DeleteFileResponse> {
    try {
      const result = await this.deleteFileUseCase.execute({ fileId });

      return {
        id: result.id,
        filename: result.filename,
        deleted: result.deleted,
        message: result.message
      };
    } catch (error) {
      const message = (error as Error).message;
      
      if (message.includes('not found')) {
        this.setStatus(404);
        throw new Error(message);
      }
      
      if (message.includes('UUID')) {
        this.setStatus(400);
        throw new Error(message);
      }
      
      this.setStatus(500);
      throw new Error(`Failed to delete file: ${message}`);
    }
  }

  /**
   * Helper method to format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 bytes';
    if (bytes === 1) return '1 byte';
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) {
      const kb = Math.round(bytes / 1024 * 100) / 100;
      return `${kb} KB`;
    }
    const mb = Math.round(bytes / (1024 * 1024) * 100) / 100;
    return `${mb} MB`;
  }
}