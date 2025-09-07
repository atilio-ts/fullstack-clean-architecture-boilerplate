import { IDomainRepository } from './IDomainRepository';
import { File } from '../entities';

/**
 * File repository interface defining contracts for file data access
 * Extends base repository with file-specific operations
 */
export interface IFileRepository extends IDomainRepository<File, string> {
  /**
   * Finds a file by its filename
   * @param filename The filename to search for
   * @returns Promise that resolves to File or null if not found
   */
  findByFilename(filename: string): Promise<File | null>;

  /**
   * Finds files by content type
   * @param contentType The content type to filter by
   * @returns Promise that resolves to array of Files
   */
  findByContentType(contentType: string): Promise<File[]>;

  /**
   * Finds files created within a date range
   * @param startDate Start of the date range
   * @param endDate End of the date range
   * @returns Promise that resolves to array of Files
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<File[]>;

  /**
   * Finds files with size within specified range
   * @param minSize Minimum file size in bytes
   * @param maxSize Maximum file size in bytes
   * @returns Promise that resolves to array of Files
   */
  findBySizeRange(minSize: number, maxSize: number): Promise<File[]>;

  /**
   * Gets the total count of files in the system
   * @returns Promise that resolves to the total count
   */
  getTotalCount(): Promise<number>;

  /**
   * Gets the total size of all files in bytes
   * @returns Promise that resolves to the total size
   */
  getTotalSize(): Promise<number>;

  /**
   * Finds files with pagination support
   * @param offset Number of records to skip
   * @param limit Maximum number of records to return
   * @param sortBy Field to sort by (filename, created_at, file_size)
   * @param sortOrder Sort order (ASC or DESC)
   * @returns Promise that resolves to array of Files
   */
  findWithPagination(
    offset: number, 
    limit: number, 
    sortBy?: 'filename' | 'created_at' | 'file_size', 
    sortOrder?: 'ASC' | 'DESC'
  ): Promise<File[]>;

  /**
   * Checks if a file with the given filename already exists
   * @param filename The filename to check
   * @returns Promise that resolves to boolean
   */
  existsByFilename(filename: string): Promise<boolean>;

  /**
   * Checks if a file with the given file path already exists
   * @param filePath The file path to check
   * @returns Promise that resolves to boolean
   */
  existsByFilePath(filePath: string): Promise<boolean>;
}