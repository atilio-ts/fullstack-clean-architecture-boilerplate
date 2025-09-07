import { expect } from 'chai';
import { stub, SinonStub } from 'sinon';
import { UploadFileUseCase, UploadFileRequest } from '../../../../src/application/usecases';
import { IFileRepository } from '../../../../src/domain/repositories';
import { File } from '../../../../src/domain/entities';
import { FileStorageService } from '../../../../src/infrastructure/services';

describe('UploadFileUseCase', () => {
  let useCase: UploadFileUseCase;
  let mockFileRepository: Partial<IFileRepository>;
  let mockStorageService: Partial<FileStorageService>;
  let repositoryFindByFilenameStub: SinonStub;
  let repositorySaveStub: SinonStub;
  let storageGetContentTypeStub: SinonStub;
  let storageValidateContentStub: SinonStub;
  let storageStoreFileStub: SinonStub;

  beforeEach(() => {
    // Mock repository
    repositoryFindByFilenameStub = stub();
    repositorySaveStub = stub();
    mockFileRepository = {
      findByFilename: repositoryFindByFilenameStub,
      save: repositorySaveStub
    };

    // Mock storage service
    storageGetContentTypeStub = stub();
    storageValidateContentStub = stub();
    storageStoreFileStub = stub();
    mockStorageService = {
      getContentType: storageGetContentTypeStub,
      validateFileContent: storageValidateContentStub,
      storeFile: storageStoreFileStub
    };

    useCase = new UploadFileUseCase(
      mockFileRepository as IFileRepository,
      mockStorageService as FileStorageService
    );
  });

  describe('execute', () => {
    it('should successfully upload a valid text file', async () => {
      // Arrange
      const request: UploadFileRequest = {
        filename: 'test.txt',
        content: 'Hello, World!',
        contentType: 'text/plain'
      };

      repositoryFindByFilenameStub.resolves(null); // File doesn't exist
      storageValidateContentStub.returns(true);
      storageStoreFileStub.resolves('uploaded-files/uuid-file.txt');
      
      const savedFile = new File(
        'test-id',
        'test.txt',
        'uploaded-files/uuid-file.txt',
        13,
        'text/plain'
      );
      repositorySaveStub.resolves(savedFile);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).to.deep.include({
        filename: 'test.txt',
        fileSize: 13,
        contentType: 'text/plain'
      });
      expect(result.id).to.be.a('string');
      expect(result.createdAt).to.be.instanceOf(Date);
    });

    it('should auto-detect content type when not provided', async () => {
      // Arrange
      const request: UploadFileRequest = {
        filename: 'test.json',
        content: '{"key": "value"}'
      };

      repositoryFindByFilenameStub.resolves(null);
      storageGetContentTypeStub.returns('application/json');
      storageValidateContentStub.returns(true);
      storageStoreFileStub.resolves('uploaded-files/uuid-file.json');
      
      const savedFile = new File(
        'test-id',
        'test.json',
        'uploaded-files/uuid-file.json',
        16,
        'application/json'
      );
      repositorySaveStub.resolves(savedFile);

      // Act
      await useCase.execute(request);

      // Assert
      expect(storageGetContentTypeStub).to.have.been.calledWith('test.json');
    });

    it('should reject upload if file with same name exists', async () => {
      // Arrange
      const request: UploadFileRequest = {
        filename: 'existing.txt',
        content: 'content'
      };

      const existingFile = new File('existing-id', 'existing.txt', '/path', 100, 'text/plain');
      repositoryFindByFilenameStub.resolves(existingFile);

      // Act & Assert
      try {
        await useCase.execute(request);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).to.include("A file with the name 'existing.txt' already exists");
      }
    });

    it('should reject invalid request data', async () => {
      // Test null request
      try {
        await useCase.execute(null as any);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).to.equal('Upload request is required');
      }

      // Test empty filename
      try {
        await useCase.execute({ filename: '', content: 'test' });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).to.equal('Filename is required');
      }

      // Test non-string content
      try {
        await useCase.execute({ filename: 'test.txt', content: 123 as any });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).to.equal('File content must be a string');
      }

      // Test empty content
      try {
        await useCase.execute({ filename: 'test.txt', content: '' });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).to.equal('File content cannot be empty');
      }
    });

    it('should reject invalid content type', async () => {
      // Arrange
      const request: UploadFileRequest = {
        filename: 'test.txt',
        content: 'content',
        contentType: 'application/pdf' as any
      };

      // Act & Assert
      try {
        await useCase.execute(request);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).to.include('Content type must be one of');
      }
    });

    it('should reject content that doesnt match content type', async () => {
      // Arrange
      const request: UploadFileRequest = {
        filename: 'test.json',
        content: 'invalid json content',
        contentType: 'application/json'
      };

      repositoryFindByFilenameStub.resolves(null);
      storageValidateContentStub.returns(false); // Content validation fails

      // Act & Assert
      try {
        await useCase.execute(request);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).to.include('File content is not valid for content type');
      }
    });

    it('should reject files with invalid extensions', async () => {
      // Arrange
      const request: UploadFileRequest = {
        filename: 'test.pdf',
        content: 'content'
      };

      // Act & Assert
      try {
        await useCase.execute(request);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).to.include('File must have one of these extensions');
      }
    });

    it('should reject oversized files', async () => {
      // Arrange
      const largeContent = 'x'.repeat(1048577); // 1MB + 1 byte
      const request: UploadFileRequest = {
        filename: 'large.txt',
        content: largeContent
      };

      // Act & Assert
      try {
        await useCase.execute(request);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).to.include('File size cannot exceed 1048576 bytes');
      }
    });
  });
});