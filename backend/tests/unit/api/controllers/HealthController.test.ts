import { expect } from 'chai';
import sinon from 'sinon';
import { HealthController } from '../../../../src/api/controllers/HealthController';
import { HealthResponse } from '../../../../src/api/dto/HealthResponse';

describe('HealthController', () => {
  let controller: HealthController;
  let processStubs: any = {};

  beforeEach(() => {
    controller = new HealthController();

    // Stub process methods
    processStubs.uptime = sinon.stub(process, 'uptime').returns(123.45);
    processStubs.memoryUsage = sinon.stub(process, 'memoryUsage').returns({
      rss: 50 * 1024 * 1024,
      heapTotal: 30 * 1024 * 1024,
      heapUsed: 20 * 1024 * 1024,
      external: 5 * 1024 * 1024,
      arrayBuffers: 1 * 1024 * 1024
    });

    // Stub environment variables
    process.env.NODE_ENV = 'test';
    process.env.npm_package_version = '1.0.0';
  });

  afterEach(() => {
    sinon.restore();
    Object.values(processStubs).forEach((stub: any) => stub.restore());
    delete process.env.NODE_ENV;
    delete process.env.npm_package_version;
  });

  describe('getHealth', () => {
    it('should return health status with all required fields', async () => {
      const result: HealthResponse = await controller.getHealth();
      
      expect(result).to.have.property('status', 'OK');
      expect(result).to.have.property('timestamp');
      expect(result).to.have.property('uptime', 123.45);
      expect(result).to.have.property('environment', 'test');
      expect(result).to.have.property('version', '1.0.0');
      expect(result).to.have.property('memory');
      expect(result).to.have.property('system');
    });

    it('should return correct memory information', async () => {
      const result: HealthResponse = await controller.getHealth();
      
      expect(result.memory).to.deep.equal({
        used: 20, // 20 MB
        total: 30, // 30 MB  
        external: 5 // 5 MB
      });
    });

    it('should return correct system information', async () => {
      const result: HealthResponse = await controller.getHealth();
      
      expect(result.system).to.have.property('platform', process.platform);
      expect(result.system).to.have.property('nodeVersion', process.version);
      expect(result.system).to.have.property('pid', process.pid);
    });

    it('should use default values when environment variables are not set', async () => {
      delete process.env.NODE_ENV;
      delete process.env.npm_package_version;

      const result: HealthResponse = await controller.getHealth();
      
      expect(result.environment).to.equal('development');
      expect(result.version).to.equal('1.0.0');
    });

    it('should return timestamp as ISO string', async () => {
      const beforeCall = new Date();
      const result: HealthResponse = await controller.getHealth();
      const afterCall = new Date();
      
      const timestamp = new Date(result.timestamp);
      
      expect(timestamp).to.be.at.least(beforeCall);
      expect(timestamp).to.be.at.most(afterCall);
      expect(result.timestamp).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should throw error when process operations fail', async () => {
      // Force an error by making process.uptime throw
      processStubs.uptime.throws(new Error('Process error'));

      try {
        await controller.getHealth();
        expect.fail('Expected method to throw');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect((error as Error).message).to.include('Health check failed: Process error');
      }
    });

    it('should handle unknown errors gracefully', async () => {
      // Force an error by making process.uptime throw a non-Error object
      processStubs.uptime.throws('Unknown error');

      try {
        await controller.getHealth();
        expect.fail('Expected method to throw');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect((error as Error).message).to.include('Health check failed:');
      }
    });
  });
});