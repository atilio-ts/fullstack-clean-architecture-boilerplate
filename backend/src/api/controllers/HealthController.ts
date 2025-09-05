import { Request, Response } from 'express';
import { BaseController } from './BaseController';

export class HealthController extends BaseController {
  public async checkHealth(req: Request, res: Response): Promise<Response> {
    try {
      const healthStatus = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
          external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100,
        },
        system: {
          platform: process.platform,
          nodeVersion: process.version,
          pid: process.pid,
        }
      };

      return this.ok(res, healthStatus);
    } catch (error) {
      return this.fail(res, error as Error);
    }
  }
}