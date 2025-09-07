/**
 * FileName value object that encapsulates filename validation logic
 */
export class FileName {
  private readonly _value: string;

  // Allowed file extensions for the application
  private static readonly ALLOWED_EXTENSIONS = ['.txt', '.md', '.json'] as const;
  
  constructor(value: string) {
    this.validate(value);
    this._value = value.trim();
  }

  public get value(): string {
    return this._value;
  }

  /**
   * Validates the filename according to business rules
   */
  private validate(filename: string): void {
    if (!filename || filename.trim().length === 0) {
      throw new Error('Filename cannot be empty');
    }

    const trimmed = filename.trim();

    // Check minimum length
    if (trimmed.length < 2) {
      throw new Error('Filename must be at least 2 characters long');
    }

    // Check maximum length
    if (trimmed.length > 255) {
      throw new Error('Filename cannot exceed 255 characters');
    }

    // Check for allowed extensions
    const hasAllowedExtension = FileName.ALLOWED_EXTENSIONS.some(ext => 
      trimmed.toLowerCase().endsWith(ext)
    );

    if (!hasAllowedExtension) {
      throw new Error(`File must have one of these extensions: ${FileName.ALLOWED_EXTENSIONS.join(', ')}`);
    }

    // Check for invalid characters (Windows and Unix)
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(trimmed)) {
      throw new Error('Filename contains invalid characters');
    }

    // Check for reserved names (Windows)
    const reservedNames = [
      'CON', 'PRN', 'AUX', 'NUL',
      'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
      'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ];

    const nameWithoutExtension = trimmed.substring(0, trimmed.lastIndexOf('.')).toUpperCase();
    if (reservedNames.includes(nameWithoutExtension)) {
      throw new Error('Filename cannot use reserved system names');
    }

    // Check for leading/trailing spaces or periods
    if (trimmed.startsWith(' ') || trimmed.endsWith(' ') || trimmed.endsWith('.')) {
      throw new Error('Filename cannot start or end with spaces or periods');
    }
  }

  /**
   * Gets the file extension from the filename
   */
  public getExtension(): string {
    const lastDotIndex = this._value.lastIndexOf('.');
    return lastDotIndex !== -1 ? this._value.substring(lastDotIndex) : '';
  }

  /**
   * Gets the filename without extension
   */
  public getNameWithoutExtension(): string {
    const lastDotIndex = this._value.lastIndexOf('.');
    return lastDotIndex !== -1 ? this._value.substring(0, lastDotIndex) : this._value;
  }

  /**
   * Checks if two FileName objects are equal
   */
  public equals(other: FileName): boolean {
    return this._value === other._value;
  }

  /**
   * Returns the string representation
   */
  public toString(): string {
    return this._value;
  }

  /**
   * Creates a FileName instance with validation
   */
  public static create(value: string): FileName {
    return new FileName(value);
  }

  /**
   * Gets all allowed extensions
   */
  public static getAllowedExtensions(): readonly string[] {
    return FileName.ALLOWED_EXTENSIONS;
  }
}