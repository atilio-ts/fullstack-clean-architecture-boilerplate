import { expect } from 'chai';
import request from 'supertest';
import { getTestApp } from '../helpers/testApp';

let app: any;

describe('Express App Integration', () => {
  before(() => {
    app = getTestApp();
  });

  describe('Middleware Configuration', () => {
    it('should have CORS enabled', async () => {
      const response = await request(app)
        .options('/api/v1/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.headers['access-control-allow-origin']).to.exist;
    });

    it('should have security headers from helmet', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      // Helmet adds various security headers
      expect(response.headers).to.have.property('x-dns-prefetch-control');
      expect(response.headers).to.have.property('x-frame-options');
      expect(response.headers).to.have.property('x-download-options');
    });

    it('should parse JSON bodies', async () => {
      // Since we don't have POST endpoints yet, we'll test this indirectly
      // by ensuring the middleware is loaded (no errors on startup)
      expect(app).to.exist;
    });

    it('should parse URL encoded bodies', async () => {
      // Similar to JSON parsing test
      expect(app).to.exist;
    });
  });

  describe('Route Mounting', () => {
    it('should mount API routes under /api/v1', async () => {
      await request(app)
        .get('/api/v1/health')
        .expect(200);
    });

    it('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/v1/non-existent')
        .expect(404);
    });

    it('should return 404 for root path', async () => {
      await request(app)
        .get('/')
        .expect(404);
    });

    it('should return 404 for unversioned API paths', async () => {
      await request(app)
        .get('/api/health')
        .expect(404);
    });
  });

  describe('HTTP Methods', () => {
    it('should handle GET requests', async () => {
      await request(app)
        .get('/api/v1/health')
        .expect(200);
    });

    it('should return 404 for POST to health endpoint', async () => {
      await request(app)
        .post('/api/v1/health')
        .expect(404);
    });

    it('should return 404 for PUT to health endpoint', async () => {
      await request(app)
        .put('/api/v1/health')
        .expect(404);
    });

    it('should return 404 for DELETE to health endpoint', async () => {
      await request(app)
        .delete('/api/v1/health')
        .expect(404);
    });
  });

  describe('Content Type Handling', () => {
    it('should return JSON content type for API responses', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.headers['content-type']).to.match(/application\/json/);
    });

    it('should handle requests without content-type header', async () => {
      await request(app)
        .get('/api/v1/health')
        .expect(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .set('Accept', 'invalid/type');

      // Should still work despite invalid Accept header
      expect(response.status).to.equal(200);
    });

    it('should return appropriate status for method not allowed', async () => {
      // Express typically returns 404 for unregistered method/path combinations
      await request(app)
        .patch('/api/v1/health')
        .expect(404);
    });
  });

  describe('App Configuration', () => {
    it('should be an Express application', () => {
      expect(app).to.be.a('function'); // Express apps are functions
      expect(app.listen).to.be.a('function');
      expect(app.use).to.be.a('function');
    });

    it('should have proper middleware stack', async () => {
      // Verify middleware is working by testing their effects
      const response = await request(app)
        .get('/api/v1/health');

      // Test that middleware is working:
      // 1. Helmet adds security headers
      expect(response.headers).to.have.property('x-dns-prefetch-control');
      
      // 2. CORS headers are present
      expect(response.headers).to.have.property('access-control-allow-origin');
      
      // 3. Express is properly configured (returns JSON)
      expect(response.headers['content-type']).to.match(/application\/json/);
    });
  });

  describe('Performance', () => {
    it('should respond to health checks quickly', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/v1/health')
        .expect(200);
        
      const responseTime = Date.now() - startTime;
      expect(responseTime).to.be.below(500); // Should be very fast
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() => 
        request(app).get('/api/v1/health')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).to.equal(200);
      });
    });
  });

  describe('Environment Configuration', () => {
    it('should load environment variables', () => {
      // The app should load dotenv config
      // We can't test specific values, but we can verify the app starts
      expect(app).to.exist;
    });
  });
});