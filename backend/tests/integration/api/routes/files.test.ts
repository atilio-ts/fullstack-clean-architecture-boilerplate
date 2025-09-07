import request from 'supertest';
import { expect } from 'chai';
import { Pool } from 'pg';
import { stub, SinonStub, restore } from 'sinon';
import express from 'express';
import { createFileRoutes } from '../../../../src/api/routes/files';
import { FileStorageService } from '../../../../src/infrastructure/services/FileStorageService';

describe('Files API Routes', () => {
  let app: express.Application;
  let mockPool: Partial<Pool>;
  let poolQueryStub: SinonStub;
  let fileStorageStub: SinonStub;

  beforeEach(() => {
    // Mock database pool
    poolQueryStub = stub();
    mockPool = {
      query: poolQueryStub
    };

    // Mock file storage service
    fileStorageStub = stub(FileStorageService.prototype, 'storeFile')
      .resolves('uploaded-files/test-uuid.txt');
    stub(FileStorageService.prototype, 'ensureDirectoryExists').resolves();
    stub(FileStorageService.prototype, 'validateFileContent').returns(true);
    stub(FileStorageService.prototype, 'getContentType').returns('text/plain');

    // Create express app with file routes
    app = express();
    app.use(express.json());
    app.use('/api/v1/files', createFileRoutes(mockPool as Pool));
    
    // Add error handling middleware
    app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(500).json({ error: error.message });
    });
  });

  afterEach(() => {
    restore(); // Restore all sinon stubs
  });

  describe('POST /api/v1/files/upload', () => {
    it('should upload a valid text file', async () => {
      const mockDate = new Date();
      const mockFileRow = {
        id: 'test-id',
        filename: 'test.txt',
        file_path: 'uploaded-files/test-id.txt',
        file_size: 13,
        content_type: 'text/plain',
        created_at: mockDate,
        updated_at: mockDate
      };

      // Mock repository calls for the complete flow:
      // 1. findByFilename (check if file exists by name) -> not found
      // 2. findById (check if file exists by id in save method) -> not found  
      // 3. createFile INSERT -> returns the created file row
      poolQueryStub
        .onCall(0).resolves({ rows: [] }) // findByFilename returns empty (file doesn't exist)
        .onCall(1).resolves({ rows: [] }) // findById returns empty (file doesn't exist)
        .onCall(2).resolves({ rows: [mockFileRow] }) // createFile INSERT returns the created file
        .resolves({ rows: [] }); // Default return for any other calls

      const response = await request(app)
        .post('/api/v1/files/upload')
        .attach('file', Buffer.from('Hello, World!'), 'test.txt');

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('filename', 'test.txt');
      expect(response.body).to.have.property('fileSize', 13);
      expect(response.body).to.have.property('contentType', 'text/plain');
      expect(response.body).to.have.property('formattedSize');
    });

    it('should return 400 for invalid file extension', async () => {
      const response = await request(app)
        .post('/api/v1/files/upload')
        .attach('file', Buffer.from('content'), 'test.pdf');

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('files are allowed');
    });

    it('should return 409 if file already exists', async () => {
      // Mock file already exists
      poolQueryStub.resolves({ 
        rows: [{
          id: 'existing-id',
          filename: 'existing.txt',
          file_path: 'uploaded-files/existing-id.txt',
          file_size: 100,
          content_type: 'text/plain',
          created_at: new Date(),
          updated_at: new Date()
        }]
      });

      const response = await request(app)
        .post('/api/v1/files/upload')
        .attach('file', Buffer.from('content'), 'existing.txt');

      expect(response.status).to.equal(409);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('already exists');
    });

    it('should return 413 for oversized files', async () => {
      const largeContent = Buffer.alloc(1048577, 'x'); // 1MB + 1 byte

      const response = await request(app)
        .post('/api/v1/files/upload')
        .attach('file', largeContent, 'large.txt');

      expect(response.status).to.equal(413);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('too large');
    });

    it('should upload a valid JSON file', async () => {
      const mockDate = new Date();
      const mockFileRow = {
        id: 'test-json-id',
        filename: 'test.json',
        file_path: 'uploaded-files/test-json-id.json',
        file_size: 17,
        content_type: 'application/json',
        created_at: mockDate,
        updated_at: mockDate
      };

      poolQueryStub
        .onCall(0).resolves({ rows: [] }) // findByFilename
        .onCall(1).resolves({ rows: [] }) // findById  
        .onCall(2).resolves({ rows: [mockFileRow] }) // createFile
        .resolves({ rows: [] });

      const jsonContent = '{"test": "value"}';
      const response = await request(app)
        .post('/api/v1/files/upload')
        .attach('file', Buffer.from(jsonContent), 'test.json')
        .set('Content-Type', 'multipart/form-data');

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('filename', 'test.json');
      expect(response.body).to.have.property('contentType', 'application/json');
    });

    it('should upload a valid markdown file', async () => {
      const mockDate = new Date();
      const mockFileRow = {
        id: 'test-md-id',
        filename: 'test.md',
        file_path: 'uploaded-files/test-md-id.md',
        file_size: 15,
        content_type: 'text/markdown',
        created_at: mockDate,
        updated_at: mockDate
      };

      poolQueryStub
        .onCall(0).resolves({ rows: [] }) // findByFilename
        .onCall(1).resolves({ rows: [] }) // findById
        .onCall(2).resolves({ rows: [mockFileRow] }) // createFile
        .resolves({ rows: [] });

      const mdContent = '# Test Markdown';
      const response = await request(app)
        .post('/api/v1/files/upload')
        .attach('file', Buffer.from(mdContent), 'test.md');

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('filename', 'test.md');
      expect(response.body).to.have.property('contentType', 'text/markdown');
    });

    it('should return 400 when no file is provided', async () => {
      const response = await request(app)
        .post('/api/v1/files/upload')
        .send({});

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error');
    });
  });

  describe('GET /api/v1/files', () => {
    it('should return list of files', async () => {
      // Mock database calls for pagination
      poolQueryStub
        .onFirstCall().resolves({ 
          rows: [{
            id: 'file1',
            filename: 'test1.txt',
            file_path: 'path1',
            file_size: 100,
            content_type: 'text/plain',
            created_at: new Date(),
            updated_at: new Date()
          }]
        }) // findWithPagination
        .onSecondCall().resolves({ rows: [{ count: '1' }] }) // getTotalCount
        .onThirdCall().resolves({ rows: [{ total_size: '100' }] }); // getTotalSize

      const response = await request(app)
        .get('/api/v1/files');

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('files');
      expect(response.body).to.have.property('totalCount', 1);
      expect(response.body).to.have.property('totalSize', 100);
      expect(response.body).to.have.property('page', 1);
      expect(response.body).to.have.property('limit', 20);
    });

    it('should support pagination parameters', async () => {
      poolQueryStub
        .onFirstCall().resolves({ rows: [] })
        .onSecondCall().resolves({ rows: [{ count: '0' }] })
        .onThirdCall().resolves({ rows: [{ total_size: '0' }] });

      const response = await request(app)
        .get('/api/v1/files')
        .query({
          page: 2,
          limit: 10,
          sortBy: 'filename',
          sortOrder: 'ASC'
        });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('page', 2);
      expect(response.body).to.have.property('limit', 10);
    });
  });

  describe('GET /api/v1/files/:fileId', () => {
    it('should return file content for valid ID', async () => {
      // Mock repository findById
      poolQueryStub.resolves({ 
        rows: [{
          id: 'test-id',
          filename: 'test.txt',
          file_path: 'uploaded-files/test.txt',
          file_size: 13,
          content_type: 'text/plain',
          created_at: new Date(),
          updated_at: new Date()
        }]
      });

      const response = await request(app)
        .get('/api/v1/files/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('filename');
      expect(response.body).to.have.property('content');
    });

    it('should return 404 for non-existent file', async () => {
      poolQueryStub.resolves({ rows: [] }); // File not found

      const response = await request(app)
        .get('/api/v1/files/nonexistent-id');

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('not found');
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/v1/files/invalid-uuid');

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('UUID');
    });
  });

  describe('DELETE /api/v1/files/:fileId', () => {
    it('should delete existing file', async () => {
      // Mock findById then delete
      poolQueryStub
        .onFirstCall().resolves({ 
          rows: [{
            id: 'test-id',
            filename: 'test.txt',
            file_path: 'uploaded-files/test.txt',
            file_size: 13,
            content_type: 'text/plain',
            created_at: new Date(),
            updated_at: new Date()
          }]
        })
        .onSecondCall().resolves({ rows: [] }); // delete success

      const response = await request(app)
        .delete('/api/v1/files/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('deleted', true);
      expect(response.body).to.have.property('message');
    });

    it('should return 404 when deleting non-existent file', async () => {
      poolQueryStub.resolves({ rows: [] }); // File not found

      const response = await request(app)
        .delete('/api/v1/files/nonexistent-id');

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('not found');
    });
  });
});