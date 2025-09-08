import { Router } from 'express';
import { Pool } from 'pg';
import healthRoutes from './health';
import docsRoutes from './docs';
import { createFileRoutes } from './files';

export function createRoutes(pool: Pool): Router {
  const router = Router();

  router.use('/health', healthRoutes);
  router.use('/docs', docsRoutes);
  router.use('/files', createFileRoutes(pool));

  return router;
}

// Maintain backward compatibility for existing code
export default function createDefaultRoutes(): Router {
  // This will need to be updated when integrating with the main server
  const router = Router();
  router.use('/health', healthRoutes);
  router.use('/docs', docsRoutes);
  return router;
}
