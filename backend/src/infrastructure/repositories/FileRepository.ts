import { Pool } from 'pg';
import { IFileRepository } from '../../domain/repositories';
import { File } from '../../domain/entities';

/**
 * PostgreSQL implementation of the file repository
 * Handles database operations for file metadata
 */
export class FileRepository implements IFileRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Finds a file by ID
   */
  async findById(id: string): Promise<File | null> {
    const query = 'SELECT * FROM files WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToFile(result.rows[0]);
  }

  /**
   * Finds all files
   */
  async findAll(): Promise<File[]> {
    const query = 'SELECT * FROM files ORDER BY created_at DESC';
    const result = await this.pool.query(query);
    
    return result.rows.map(row => this.mapRowToFile(row));
  }

  /**
   * Saves a file (create or update)
   */
  async save(file: File): Promise<File> {
    const existingFile = await this.findById(file.id);
    
    if (existingFile) {
      return this.updateFile(file);
    } else {
      return this.createFile(file);
    }
  }

  /**
   * Deletes a file by ID
   */
  async delete(id: string): Promise<void> {
    const query = 'DELETE FROM files WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  /**
   * Finds a file by filename
   */
  async findByFilename(filename: string): Promise<File | null> {
    const query = 'SELECT * FROM files WHERE filename = $1';
    const result = await this.pool.query(query, [filename]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToFile(result.rows[0]);
  }

  /**
   * Finds files by content type
   */
  async findByContentType(contentType: string): Promise<File[]> {
    const query = 'SELECT * FROM files WHERE content_type = $1 ORDER BY created_at DESC';
    const result = await this.pool.query(query, [contentType]);
    
    return result.rows.map(row => this.mapRowToFile(row));
  }

  /**
   * Finds files created within a date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<File[]> {
    const query = `
      SELECT * FROM files 
      WHERE created_at >= $1 AND created_at <= $2 
      ORDER BY created_at DESC
    `;
    const result = await this.pool.query(query, [startDate, endDate]);
    
    return result.rows.map(row => this.mapRowToFile(row));
  }

  /**
   * Finds files with size within specified range
   */
  async findBySizeRange(minSize: number, maxSize: number): Promise<File[]> {
    const query = `
      SELECT * FROM files 
      WHERE file_size >= $1 AND file_size <= $2 
      ORDER BY file_size DESC
    `;
    const result = await this.pool.query(query, [minSize, maxSize]);
    
    return result.rows.map(row => this.mapRowToFile(row));
  }

  /**
   * Gets the total count of files
   */
  async getTotalCount(): Promise<number> {
    const query = 'SELECT COUNT(*) FROM files';
    const result = await this.pool.query(query);
    
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Gets the total size of all files in bytes
   */
  async getTotalSize(): Promise<number> {
    const query = 'SELECT COALESCE(SUM(file_size), 0) as total_size FROM files';
    const result = await this.pool.query(query);
    
    return parseInt(result.rows[0].total_size, 10);
  }

  /**
   * Finds files with pagination support
   */
  async findWithPagination(
    offset: number, 
    limit: number, 
    sortBy: 'filename' | 'created_at' | 'file_size' = 'created_at', 
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<File[]> {
    // Validate sort parameters to prevent SQL injection
    const allowedSortFields = ['filename', 'created_at', 'file_size'];
    const allowedSortOrders = ['ASC', 'DESC'];
    
    if (!allowedSortFields.includes(sortBy)) {
      throw new Error(`Invalid sort field: ${sortBy}`);
    }
    
    if (!allowedSortOrders.includes(sortOrder)) {
      throw new Error(`Invalid sort order: ${sortOrder}`);
    }

    const query = `
      SELECT * FROM files 
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $1 OFFSET $2
    `;
    const result = await this.pool.query(query, [limit, offset]);
    
    return result.rows.map(row => this.mapRowToFile(row));
  }

  /**
   * Checks if a file with the given filename exists
   */
  async existsByFilename(filename: string): Promise<boolean> {
    const query = 'SELECT 1 FROM files WHERE filename = $1 LIMIT 1';
    const result = await this.pool.query(query, [filename]);
    
    return result.rows.length > 0;
  }

  /**
   * Checks if a file with the given file path exists
   */
  async existsByFilePath(filePath: string): Promise<boolean> {
    const query = 'SELECT 1 FROM files WHERE file_path = $1 LIMIT 1';
    const result = await this.pool.query(query, [filePath]);
    
    return result.rows.length > 0;
  }

  /**
   * Creates a new file record
   */
  private async createFile(file: File): Promise<File> {
    const query = `
      INSERT INTO files (id, filename, file_path, file_size, content_type, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [
      file.id,
      file.filename,
      file.filePath,
      file.fileSize,
      file.contentType,
      file.createdAt,
      file.updatedAt
    ]);
    
    return this.mapRowToFile(result.rows[0]);
  }

  /**
   * Updates an existing file record
   */
  private async updateFile(file: File): Promise<File> {
    const query = `
      UPDATE files 
      SET filename = $2, file_path = $3, file_size = $4, content_type = $5, updated_at = $6
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [
      file.id,
      file.filename,
      file.filePath,
      file.fileSize,
      file.contentType,
      new Date()
    ]);
    
    return this.mapRowToFile(result.rows[0]);
  }

  /**
   * Maps a database row to a File entity
   */
  private mapRowToFile(row: any): File {
    return new File(
      row.id,
      row.filename,
      row.file_path,
      row.file_size,
      row.content_type,
      row.created_at,
      row.updated_at
    );
  }

  /**
   * Gets all file paths for cleanup operations
   */
  async getAllFilePaths(): Promise<string[]> {
    const query = 'SELECT file_path FROM files';
    const result = await this.pool.query(query);
    
    return result.rows.map(row => row.file_path);
  }

  /**
   * Batch delete files by IDs
   */
  async deleteBatch(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    
    const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
    const query = `DELETE FROM files WHERE id IN (${placeholders})`;
    
    await this.pool.query(query, ids);
  }

  /**
   * Search files by filename pattern (case-insensitive)
   */
  async searchByFilename(pattern: string): Promise<File[]> {
    const query = `
      SELECT * FROM files 
      WHERE filename ILIKE $1 
      ORDER BY created_at DESC
    `;
    const result = await this.pool.query(query, [`%${pattern}%`]);
    
    return result.rows.map(row => this.mapRowToFile(row));
  }
}