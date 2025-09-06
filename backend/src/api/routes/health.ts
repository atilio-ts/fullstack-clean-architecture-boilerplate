import { Router, Request, Response } from 'express';
import { HealthController } from '../controllers/HealthController';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const healthController = new HealthController();
  try {
    const healthData = await healthController.getHealth();
    res.status(200).json(healthData);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

export default router;