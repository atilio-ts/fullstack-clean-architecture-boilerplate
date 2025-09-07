/**
 * FileSize value object that encapsulates file size validation logic
 */
export class FileSize {
  private readonly _value: number;

  // Maximum allowed file size: 1MB in bytes
  public static readonly MAX_SIZE_BYTES = 1048576; // 1MB
  public static readonly MIN_SIZE_BYTES = 1; // 1 byte

  constructor(value: number) {
    this.validate(value);
    this._value = value;
  }

  public get value(): number {
    return this._value;
  }

  /**
   * Validates the file size according to business rules
   */
  private validate(size: number): void {
    if (typeof size !== 'number' || isNaN(size) || !isFinite(size)) {
      throw new Error('File size must be a valid number');
    }

    if (size < FileSize.MIN_SIZE_BYTES) {
      throw new Error(`File size must be at least ${FileSize.MIN_SIZE_BYTES} byte`);
    }

    if (size > FileSize.MAX_SIZE_BYTES) {
      throw new Error(`File size cannot exceed ${this.formatBytes(FileSize.MAX_SIZE_BYTES)}`);
    }

    // Ensure it's a whole number (no decimals for bytes)
    if (!Number.isInteger(size)) {
      throw new Error('File size must be a whole number of bytes');
    }
  }

  /**
   * Gets human-readable file size string
   */
  public toHumanReadable(): string {
    return this.formatBytes(this._value);
  }

  /**
   * Helper method to format bytes into human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 bytes';
    
    if (bytes === 1) return '1 byte';

    if (bytes < 1024) {
      return `${bytes} bytes`;
    }

    if (bytes < 1024 * 1024) {
      const kb = Math.round(bytes / 1024 * 100) / 100;
      return `${kb} KB`;
    }

    const mb = Math.round(bytes / (1024 * 1024) * 100) / 100;
    return `${mb} MB`;
  }

  /**
   * Gets size in kilobytes
   */
  public toKilobytes(): number {
    return Math.round(this._value / 1024 * 100) / 100;
  }

  /**
   * Gets size in megabytes
   */
  public toMegabytes(): number {
    return Math.round(this._value / (1024 * 1024) * 100) / 100;
  }

  /**
   * Checks if the file size is considered small (< 10KB)
   */
  public isSmall(): boolean {
    return this._value < 10240; // 10KB
  }

  /**
   * Checks if the file size is considered medium (10KB - 100KB)
   */
  public isMedium(): boolean {
    return this._value >= 10240 && this._value < 102400; // 10KB - 100KB
  }

  /**
   * Checks if the file size is considered large (> 100KB)
   */
  public isLarge(): boolean {
    return this._value >= 102400; // > 100KB
  }

  /**
   * Checks if two FileSize objects are equal
   */
  public equals(other: FileSize): boolean {
    return this._value === other._value;
  }

  /**
   * Compares two FileSize objects
   * Returns: -1 if smaller, 0 if equal, 1 if larger
   */
  public compareTo(other: FileSize): number {
    if (this._value < other._value) return -1;
    if (this._value > other._value) return 1;
    return 0;
  }

  /**
   * Returns the numeric value
   */
  public toString(): string {
    return this._value.toString();
  }

  /**
   * Creates a FileSize instance with validation
   */
  public static create(value: number): FileSize {
    return new FileSize(value);
  }

  /**
   * Creates a FileSize from a string representation
   */
  public static fromString(value: string): FileSize {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error('Invalid file size string');
    }
    return new FileSize(parsed);
  }

  /**
   * Gets the maximum allowed file size
   */
  public static getMaxSize(): number {
    return FileSize.MAX_SIZE_BYTES;
  }

  /**
   * Gets the minimum allowed file size
   */
  public static getMinSize(): number {
    return FileSize.MIN_SIZE_BYTES;
  }
}