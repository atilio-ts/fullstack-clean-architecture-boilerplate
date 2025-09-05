import { expect } from 'chai';
import { Request, Response } from 'express';
import sinon from 'sinon';
import { HealthController } from '../../../../src/api/controllers/HealthController';

describe('HealthController', () => {
  let controller: HealthController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusStub: sinon.SinonStub;
  let jsonStub: sinon.SinonStub;
  let typeStub: sinon.SinonStub;
  let processStubs: any = {};

  beforeEach(() => {
    controller = new HealthController();
    
    jsonStub = sinon.stub();
    statusStub = sinon.stub();
    typeStub = sinon.stub();

    statusStub.returns({ json: jsonStub });
    
    res = {
      status: statusStub,
      json: jsonStub,
      type: typeStub
    };

    req = {};

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

  describe('checkHealth', () => {
    it('should return health status with all required fields', async () => {
      const result = await controller.checkHealth(req as Request, res as Response);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(typeStub.calledWith('application/json')).to.be.true;
      
      const healthStatus = jsonStub.getCall(0).args[0];
      
      expect(healthStatus).to.have.property('status', 'OK');
      expect(healthStatus).to.have.property('timestamp');
      expect(healthStatus).to.have.property('uptime', 123.45);
      expect(healthStatus).to.have.property('environment', 'test');
      expect(healthStatus).to.have.property('version', '1.0.0');
      expect(healthStatus).to.have.property('memory');
      expect(healthStatus).to.have.property('system');
    });

    it('should return correct memory information', async () => {
      await controller.checkHealth(req as Request, res as Response);
      
      const healthStatus = jsonStub.getCall(0).args[0];
      
      expect(healthStatus.memory).to.deep.equal({
        used: 20, // 20 MB
        total: 30, // 30 MB  
        external: 5 // 5 MB
      });
    });

    it('should return correct system information', async () => {
      await controller.checkHealth(req as Request, res as Response);
      
      const healthStatus = jsonStub.getCall(0).args[0];
      
      expect(healthStatus.system).to.have.property('platform', process.platform);
      expect(healthStatus.system).to.have.property('nodeVersion', process.version);
      expect(healthStatus.system).to.have.property('pid', process.pid);
    });

    it('should use default values when environment variables are not set', async () => {
      delete process.env.NODE_ENV;
      delete process.env.npm_package_version;

      await controller.checkHealth(req as Request, res as Response);
      
      const healthStatus = jsonStub.getCall(0).args[0];
      
      expect(healthStatus.environment).to.equal('development');
      expect(healthStatus.version).to.equal('1.0.0');
    });

    it('should return timestamp as ISO string', async () => {
      const beforeCall = new Date();
      await controller.checkHealth(req as Request, res as Response);
      const afterCall = new Date();
      
      const healthStatus = jsonStub.getCall(0).args[0];
      const timestamp = new Date(healthStatus.timestamp);
      
      expect(timestamp).to.be.at.least(beforeCall);
      expect(timestamp).to.be.at.most(afterCall);
      expect(healthStatus.timestamp).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should handle errors and return 500 status', async () => {
      // Force an error by making process.uptime throw
      processStubs.uptime.throws(new Error('Process error'));

      await controller.checkHealth(req as Request, res as Response);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Internal server error' })).to.be.true;
    });

    it('should log errors when they occur', async () => {
      const consoleStub = sinon.stub(console, 'log');
      const error = new Error('Test error');
      processStubs.uptime.throws(error);

      await controller.checkHealth(req as Request, res as Response);

      expect(consoleStub.calledWith(error)).to.be.true;
      consoleStub.restore();
    });
  });
});