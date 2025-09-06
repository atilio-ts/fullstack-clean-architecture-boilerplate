import { Router } from 'express';
import healthRoutes from './health';
import docsRoutes from './docs';

const router = Router();

router.use('/health', healthRoutes);
router.use('/docs', docsRoutes);

export default router;
