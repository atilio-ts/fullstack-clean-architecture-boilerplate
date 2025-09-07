import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createRoutes } from './api/routes';
import { DatabaseService } from './infrastructure/database';
import { FileStorageService } from './infrastructure/services';

dotenv.config();

const app = express();

// Middleware setup
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' })); // Set JSON body limit to 1MB for file uploads
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Initialize database and routes
const initializeApp = async () => {
  try {
    // Initialize database connection
    const databaseService = DatabaseService.getInstance();
    await databaseService.initialize();
    
    // Initialize file storage directory
    const fileStorageService = new FileStorageService();
    await fileStorageService.ensureDirectoryExists();
    
    // Setup routes with database pool
    const pool = databaseService.getPool();
    app.use('/api/v1', createRoutes(pool));
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Initialize the application (skip during testing)
if (process.env.NODE_ENV !== 'test') {
  initializeApp();
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT. Graceful shutdown...');
  
  try {
    const databaseService = DatabaseService.getInstance();
    await databaseService.close();
    console.log('Application shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Graceful shutdown...');
  
  try {
    const databaseService = DatabaseService.getInstance();
    await databaseService.close();
    console.log('Application shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

export default app;