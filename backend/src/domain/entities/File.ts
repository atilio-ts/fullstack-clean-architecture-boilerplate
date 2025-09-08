import { BaseEntity } from './BaseEntity';

/**
 * File domain entity representing a document in the system
 * Enforces business rules for file management
 */
export class File extends BaseEntity<string> {
  public readonly filename: string;
  public readonly filePath: string;
  public readonly fileSize: number;
  public readonly contentType: string;

  // Maximum file size: 1MB in bytes
  public static readonly MAX_FILE_SIZE = 1048576;
  
  // Allowed content types
  public static readonly ALLOWED_CONTENT_TYPES = [
    'text/plain',
    'text/markdown', 
    'application/json'
  ] as const;

  // Allowed file extensions
  public static readonly ALLOWED_EXTENSIONS = [
    '.txt',
    '.md',
    '.json'
  ] as const;

  constructor(
    id: string,
    filename: string,
    filePath: string,
    fileSize: number,
    contentType: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id);
    
    this.validateFilename(filename);
    this.validateFileSize(fileSize);
    this.validateContentType(contentType);
    
    this.filename = filename;
    this.filePath = filePath;
    this.fileSize = fileSize;
    this.contentType = contentType;
    
    if (createdAt) {
      (this as any).createdAt = createdAt;
    }
    if (updatedAt) {
      (this as any).updatedAt = updatedAt;
    }
  }

  /**
   * Validates that the filename has an allowed extension
   */
  private validateFilename(filename: string): void {
    if (!filename || filename.trim().length === 0) {
      throw new Error('Filename cannot be empty');
    }

    const hasAllowedExtension = File.ALLOWED_EXTENSIONS.some(ext => 
      filename.toLowerCase().endsWith(ext)
    );

    if (!hasAllowedExtension) {
      throw new Error(`File must have one of these extensions: ${File.ALLOWED_EXTENSIONS.join(', ')}`);
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(filename)) {
      throw new Error('Filename contains invalid characters');
    }
  }

  /**
   * Validates that the file size is within allowed limits
   */
  private validateFileSize(fileSize: number): void {
    if (fileSize <= 0) {
      throw new Error('File size must be greater than 0');
    }

    if (fileSize > File.MAX_FILE_SIZE) {
      throw new Error(`File size cannot exceed ${File.MAX_FILE_SIZE} bytes (1MB)`);
    }
  }

  /**
   * Validates that the content type is allowed
   */
  private validateContentType(contentType: string): void {
    if (!File.ALLOWED_CONTENT_TYPES.includes(contentType as any)) {
      throw new Error(`Content type must be one of: ${File.ALLOWED_CONTENT_TYPES.join(', ')}`);
    }
  }

  /**
   * Gets the file extension from filename
   */
  public getFileExtension(): string {
    const lastDotIndex = this.filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? this.filename.substring(lastDotIndex) : '';
  }

  /**
   * Gets human-readable file size
   */
  public getFormattedSize(): string {
    if (this.fileSize < 1024) {
      return `${this.fileSize} bytes`;
    } else if (this.fileSize < 1024 * 1024) {
      return `${Math.round(this.fileSize / 1024 * 100) / 100} KB`;
    } else {
      return `${Math.round(this.fileSize / (1024 * 1024) * 100) / 100} MB`;
    }
  }

  /**
   * Checks if the file is a text file
   */
  public isTextFile(): boolean {
    return this.contentType === 'text/plain' || this.contentType === 'text/markdown';
  }

  /**
   * Checks if the file is a JSON file
   */
  public isJsonFile(): boolean {
    return this.contentType === 'application/json';
  }

  /**
   * Creates a new File entity with validation
   */
  public static create(
    id: string,
    filename: string,
    filePath: string,
    fileSize: number,
    contentType: string
  ): File {
    return new File(id, filename, filePath, fileSize, contentType);
  }
}