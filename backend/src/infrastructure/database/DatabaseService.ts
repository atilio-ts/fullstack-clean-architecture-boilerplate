import { Pool, PoolConfig } from 'pg';
import { databaseConfig } from '../config';

/**
 * Database service responsible for managing PostgreSQL connections
 * Implements connection pooling for optimal performance
 */
export class DatabaseService {
  private pool: Pool;
  private static instance: DatabaseService;

  private constructor() {
    const config: PoolConfig = {
      host: databaseConfig.host,
      port: databaseConfig.port,
      database: databaseConfig.database,
      user: databaseConfig.username,
      password: databaseConfig.password,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    };

    this.pool = new Pool(config);

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  /**
   * Gets the singleton instance of DatabaseService
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Gets the database connection pool
   */
  public getPool(): Pool {
    return this.pool;
  }

  /**
   * Tests the database connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  /**
   * Initializes the database connection and ensures it's working
   */
  public async initialize(): Promise<void> {
    console.log('Initializing database connection...');
    
    const isConnected = await this.testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }
    
    console.log('Database connection established successfully');
  }

  /**
   * Closes all database connections
   */
  public async close(): Promise<void> {
    console.log('Closing database connections...');
    await this.pool.end();
    console.log('Database connections closed');
  }

  /**
   * Gets database statistics
   */
  public getStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    };
  }
}