import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Pool } from 'pg';
import { createRoutes } from '../../src/api/routes';

/**
 * Create test app with mocked database for basic testing
 */
export function createTestApp(): express.Application {
  const app = express();

  // Middleware setup
  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Create a minimal mock pool for testing
  const mockPool = {
    query: async () => ({ rows: [] }),
    end: async () => {},
    connect: async () => ({ release: () => {} }),
  } as unknown as Pool;
  
  // Setup routes with mock pool
  app.use('/api/v1', createRoutes(mockPool));
  
  return app;
}

// Cache the initialized app for reuse in tests
let testAppInstance: express.Application | null = null;

export function getTestApp(): express.Application {
  if (!testAppInstance) {
    testAppInstance = createTestApp();
  }
  return testAppInstance;
}