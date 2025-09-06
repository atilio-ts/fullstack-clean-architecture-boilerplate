import { Route, Get, Tags, SuccessResponse, Example, Controller } from 'tsoa';
import { HealthResponse } from '../dto/HealthResponse';

@Route('health')
@Tags('Health')
export class HealthController extends Controller {
  /**
   * Get application health status
   * @summary Check API health and system information
   */
  @Get()
  @SuccessResponse('200', 'Health check successful')
  @Example<HealthResponse>({
    status: 'OK',
    timestamp: '2023-09-06T10:30:00.000Z',
    uptime: 3600,
    environment: 'development',
    version: '1.0.0',
    memory: {
      used: 25.5,
      total: 50.0,
      external: 5.2
    },
    system: {
      platform: 'linux',
      nodeVersion: 'v18.17.0',
      pid: 12345
    }
  })
  public async getHealth(): Promise<HealthResponse> {
    try {
      const healthStatus: HealthResponse = {
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

      return healthStatus;
    } catch (error) {
      throw new Error(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}