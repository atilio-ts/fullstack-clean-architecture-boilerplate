import { IUseCase } from './IUseCase';
import { IFileRepository } from '../../domain/repositories';

/**
 * Request model for getting all files (with optional pagination)
 */
export interface GetAllFilesRequest {
  page?: number;
  limit?: number;
  sortBy?: 'filename' | 'created_at' | 'file_size';
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * File summary for listing
 */
export interface FileSummary {
  id: string;
  filename: string;
  fileSize: number;
  formattedSize: string;
  contentType: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Response model for getting all files
 */
export interface GetAllFilesResponse {
  files: FileSummary[];
  totalCount: number;
  totalSize: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Use case for retrieving all files with optional pagination
 * Returns file metadata without content for listing purposes
 */
export class GetAllFilesUseCase implements IUseCase<GetAllFilesRequest, GetAllFilesResponse> {
  constructor(private fileRepository: IFileRepository) {}

  async execute(request: GetAllFilesRequest = {}): Promise<GetAllFilesResponse> {
    // Set defaults
    const page = Math.max(1, request.page || 1);
    const limit = Math.min(100, Math.max(1, request.limit || 20));
    const sortBy = request.sortBy || 'created_at';
    const sortOrder = request.sortOrder || 'DESC';

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get files with pagination
    const files = await this.fileRepository.findWithPagination(offset, limit, sortBy, sortOrder);
    
    // Get total counts
    const [totalCount, totalSize] = await Promise.all([
      this.fileRepository.getTotalCount(),
      this.fileRepository.getTotalSize()
    ]);

    // Map to response format
    const fileSummaries: FileSummary[] = files.map(file => ({
      id: file.id,
      filename: file.filename,
      fileSize: file.fileSize,
      formattedSize: file.getFormattedSize(),
      contentType: file.contentType,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      files: fileSummaries,
      totalCount,
      totalSize,
      page,
      limit,
      hasNextPage,
      hasPreviousPage
    };
  }
}