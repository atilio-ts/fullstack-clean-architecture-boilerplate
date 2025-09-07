import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service responsible for physical file storage operations
 * Handles file system interactions for the uploaded files
 */
export class FileStorageService {
  private readonly uploadDirectory: string;

  constructor(uploadDirectory: string = 'uploaded-files') {
    // Use absolute path from project root
    this.uploadDirectory = path.resolve(process.cwd(), uploadDirectory);
  }

  /**
   * Ensures the upload directory exists
   */
  public async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.access(this.uploadDirectory);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(this.uploadDirectory, { recursive: true });
    }
  }

  /**
   * Stores file content to disk and returns the file path
   * @param content The file content to store
   * @param originalFilename The original filename for extension detection
   * @returns Promise that resolves to the generated file path
   */
  public async storeFile(content: string, originalFilename: string): Promise<string> {
    await this.ensureDirectoryExists();

    // Generate unique filename while preserving extension
    const extension = path.extname(originalFilename);
    const uniqueFilename = `${uuidv4()}${extension}`;
    const filePath = path.join(this.uploadDirectory, uniqueFilename);

    // Write content to file
    await fs.writeFile(filePath, content, 'utf8');

    // Return relative path for database storage
    return path.relative(process.cwd(), filePath);
  }

  /**
   * Reads file content from disk
   * @param filePath The relative file path
   * @returns Promise that resolves to the file content
   */
  public async readFile(filePath: string): Promise<string> {
    const absolutePath = path.resolve(process.cwd(), filePath);
    
    try {
      const content = await fs.readFile(absolutePath, 'utf8');
      return content;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      }
      throw new Error(`Failed to read file: ${(error as Error).message}`);
    }
  }

  /**
   * Deletes a file from disk
   * @param filePath The relative file path
   * @returns Promise that resolves when file is deleted
   */
  public async deleteFile(filePath: string): Promise<void> {
    const absolutePath = path.resolve(process.cwd(), filePath);
    
    try {
      await fs.unlink(absolutePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist, consider it already deleted
        return;
      }
      throw new Error(`Failed to delete file: ${(error as Error).message}`);
    }
  }

  /**
   * Checks if a file exists on disk
   * @param filePath The relative file path
   * @returns Promise that resolves to boolean indicating existence
   */
  public async fileExists(filePath: string): Promise<boolean> {
    const absolutePath = path.resolve(process.cwd(), filePath);
    
    try {
      await fs.access(absolutePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets file stats (size, dates, etc.)
   * @param filePath The relative file path
   * @returns Promise that resolves to file stats
   */
  public async getFileStats(filePath: string): Promise<{
    size: number;
    created: Date;
    modified: Date;
    isFile: boolean;
  }> {
    const absolutePath = path.resolve(process.cwd(), filePath);
    
    try {
      const stats = await fs.stat(absolutePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile()
      };
    } catch (error) {
      throw new Error(`Failed to get file stats: ${(error as Error).message}`);
    }
  }

  /**
   * Validates file content based on content type
   * @param content The file content
   * @param contentType The expected content type
   * @returns boolean indicating if content is valid
   */
  public validateFileContent(content: string, contentType: string): boolean {
    try {
      switch (contentType) {
        case 'application/json':
          // Validate JSON by parsing it
          JSON.parse(content);
          return true;
          
        case 'text/plain':
        case 'text/markdown':
          // For text files, just check if it's valid UTF-8 string
          return typeof content === 'string';
          
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Gets the content type based on file extension
   * @param filename The filename with extension
   * @returns The appropriate content type
   */
  public getContentType(filename: string): string {
    const extension = path.extname(filename).toLowerCase();
    
    switch (extension) {
      case '.json':
        return 'application/json';
      case '.md':
        return 'text/markdown';
      case '.txt':
      default:
        return 'text/plain';
    }
  }

  /**
   * Gets the upload directory path
   * @returns The absolute path to upload directory
   */
  public getUploadDirectory(): string {
    return this.uploadDirectory;
  }

  /**
   * Cleans up orphaned files (files on disk not in database)
   * This should be called periodically to maintain storage cleanliness
   * @param validFilePaths Array of file paths that should exist
   * @returns Promise that resolves to array of cleaned up file paths
   */
  public async cleanupOrphanedFiles(validFilePaths: string[]): Promise<string[]> {
    await this.ensureDirectoryExists();
    
    const cleanedFiles: string[] = [];
    
    try {
      const files = await fs.readdir(this.uploadDirectory);
      
      for (const file of files) {
        const filePath = path.join('uploaded-files', file);
        
        // Check if this file path is in the valid list
        if (!validFilePaths.includes(filePath)) {
          await this.deleteFile(filePath);
          cleanedFiles.push(filePath);
        }
      }
    } catch (error) {
      throw new Error(`Failed to cleanup orphaned files: ${(error as Error).message}`);
    }
    
    return cleanedFiles;
  }
}