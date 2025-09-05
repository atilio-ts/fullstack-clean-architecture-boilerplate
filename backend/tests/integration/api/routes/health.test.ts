import { expect } from 'chai';
import request from 'supertest';
import app from '../../../../src/app';

describe('Health Route Integration', () => {
  describe('GET /api/v1/health', () => {
    it('should return 200 with health status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).to.have.property('status', 'OK');
      expect(response.body).to.have.property('timestamp');
      expect(response.body).to.have.property('uptime');
      expect(response.body).to.have.property('environment');
      expect(response.body).to.have.property('version');
      expect(response.body).to.have.property('memory');
      expect(response.body).to.have.property('system');
    });

    it('should return valid timestamp format', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toISOString()).to.equal(response.body.timestamp);
    });

    it('should return numeric uptime', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.body.uptime).to.be.a('number');
      expect(response.body.uptime).to.be.at.least(0);
    });

    it('should return memory information with correct structure', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.body.memory).to.have.property('used');
      expect(response.body.memory).to.have.property('total');
      expect(response.body.memory).to.have.property('external');
      
      expect(response.body.memory.used).to.be.a('number');
      expect(response.body.memory.total).to.be.a('number');
      expect(response.body.memory.external).to.be.a('number');
    });

    it('should return system information with correct structure', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.body.system).to.have.property('platform');
      expect(response.body.system).to.have.property('nodeVersion');
      expect(response.body.system).to.have.property('pid');
      
      expect(response.body.system.platform).to.be.a('string');
      expect(response.body.system.nodeVersion).to.be.a('string');
      expect(response.body.system.pid).to.be.a('number');
    });

    it('should return consistent data structure across multiple requests', async () => {
      const response1 = await request(app).get('/api/v1/health');
      const response2 = await request(app).get('/api/v1/health');

      // Structure should be the same
      expect(Object.keys(response1.body)).to.deep.equal(Object.keys(response2.body));
      expect(Object.keys(response1.body.memory)).to.deep.equal(Object.keys(response2.body.memory));
      expect(Object.keys(response1.body.system)).to.deep.equal(Object.keys(response2.body.system));

      // Static values should be the same
      expect(response1.body.status).to.equal(response2.body.status);
      expect(response1.body.environment).to.equal(response2.body.environment);
      expect(response1.body.version).to.equal(response2.body.version);
    });

    it('should have response time within acceptable limits', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/v1/health')
        .expect(200);
        
      const responseTime = Date.now() - startTime;
      
      // Health check should be fast (less than 100ms in most cases)
      expect(responseTime).to.be.below(1000);
    });

    it('should handle concurrent requests', async () => {
      const numberOfRequests = 5;
      const promises = Array(numberOfRequests).fill(null).map(() => 
        request(app).get('/api/v1/health').expect(200)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body).to.have.property('status', 'OK');
      });
    });
  });

  describe('Error handling', () => {
    it('should handle malformed requests gracefully', async () => {
      // Test with invalid headers
      const response = await request(app)
        .get('/api/v1/health')
        .set('Content-Type', 'invalid/type');

      expect(response.status).to.equal(200); // Should still work
      expect(response.body.status).to.equal('OK');
    });
  });

  describe('API versioning', () => {
    it('should be accessible via versioned endpoint', async () => {
      await request(app)
        .get('/api/v1/health')
        .expect(200);
    });

    it('should not be accessible without version', async () => {
      await request(app)
        .get('/api/health')
        .expect(404);
    });

    it('should not be accessible at root level', async () => {
      await request(app)
        .get('/health')
        .expect(404);
    });
  });
});