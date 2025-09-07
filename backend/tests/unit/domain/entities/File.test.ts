import { expect } from 'chai';
import { File } from '../../../../src/domain/entities';

describe('File Entity', () => {
  describe('constructor', () => {
    it('should create a valid file entity', () => {
      const file = new File(
        'test-id',
        'test.txt',
        '/path/to/test.txt',
        1024,
        'text/plain'
      );

      expect(file.id).to.equal('test-id');
      expect(file.filename).to.equal('test.txt');
      expect(file.filePath).to.equal('/path/to/test.txt');
      expect(file.fileSize).to.equal(1024);
      expect(file.contentType).to.equal('text/plain');
    });

    it('should validate filename with allowed extensions', () => {
      expect(() => new File('id', 'test.txt', '/path', 100, 'text/plain')).to.not.throw();
      expect(() => new File('id', 'test.md', '/path', 100, 'text/markdown')).to.not.throw();
      expect(() => new File('id', 'test.json', '/path', 100, 'application/json')).to.not.throw();
    });

    it('should reject filename with invalid extensions', () => {
      expect(() => new File('id', 'test.pdf', '/path', 100, 'application/pdf'))
        .to.throw('File must have one of these extensions: .txt, .md, .json');
    });

    it('should reject empty filename', () => {
      expect(() => new File('id', '', '/path', 100, 'text/plain'))
        .to.throw('Filename cannot be empty');
    });

    it('should reject filename with invalid characters', () => {
      expect(() => new File('id', 'test<>.txt', '/path', 100, 'text/plain'))
        .to.throw('Filename contains invalid characters');
    });

    it('should validate file size within limits', () => {
      expect(() => new File('id', 'test.txt', '/path', 1, 'text/plain')).to.not.throw();
      expect(() => new File('id', 'test.txt', '/path', File.MAX_FILE_SIZE, 'text/plain')).to.not.throw();
    });

    it('should reject file size exceeding limits', () => {
      expect(() => new File('id', 'test.txt', '/path', 0, 'text/plain'))
        .to.throw('File size must be greater than 0');
      
      expect(() => new File('id', 'test.txt', '/path', File.MAX_FILE_SIZE + 1, 'text/plain'))
        .to.throw('File size cannot exceed 1048576 bytes (1MB)');
    });

    it('should validate content type', () => {
      expect(() => new File('id', 'test.txt', '/path', 100, 'text/plain')).to.not.throw();
      expect(() => new File('id', 'test.md', '/path', 100, 'text/markdown')).to.not.throw();
      expect(() => new File('id', 'test.json', '/path', 100, 'application/json')).to.not.throw();
    });

    it('should reject invalid content type', () => {
      expect(() => new File('id', 'test.txt', '/path', 100, 'application/pdf'))
        .to.throw('Content type must be one of: text/plain, text/markdown, application/json');
    });
  });

  describe('methods', () => {
    let file: File;

    beforeEach(() => {
      file = new File('id', 'test.txt', '/path/test.txt', 1024, 'text/plain');
    });

    it('should get file extension', () => {
      expect(file.getFileExtension()).to.equal('.txt');
    });

    it('should format file size correctly', () => {
      const smallFile = new File('id', 'small.txt', '/path', 100, 'text/plain');
      const mediumFile = new File('id', 'medium.txt', '/path', 1536, 'text/plain');
      const largeFile = new File('id', 'large.txt', '/path', 1048576, 'text/plain');

      expect(smallFile.getFormattedSize()).to.equal('100 bytes');
      expect(mediumFile.getFormattedSize()).to.equal('1.5 KB');
      expect(largeFile.getFormattedSize()).to.equal('1 MB');
    });

    it('should identify text files', () => {
      const textFile = new File('id', 'test.txt', '/path', 100, 'text/plain');
      const markdownFile = new File('id', 'test.md', '/path', 100, 'text/markdown');
      const jsonFile = new File('id', 'test.json', '/path', 100, 'application/json');

      expect(textFile.isTextFile()).to.be.true;
      expect(markdownFile.isTextFile()).to.be.true;
      expect(jsonFile.isTextFile()).to.be.false;
    });

    it('should identify JSON files', () => {
      const textFile = new File('id', 'test.txt', '/path', 100, 'text/plain');
      const jsonFile = new File('id', 'test.json', '/path', 100, 'application/json');

      expect(textFile.isJsonFile()).to.be.false;
      expect(jsonFile.isJsonFile()).to.be.true;
    });
  });

  describe('static methods', () => {
    it('should create file with validation', () => {
      const file = File.create('id', 'test.txt', '/path', 100, 'text/plain');
      expect(file).to.be.instanceOf(File);
      expect(file.filename).to.equal('test.txt');
    });

    it('should provide constants for validation', () => {
      expect(File.MAX_FILE_SIZE).to.equal(1048576);
      expect(File.ALLOWED_CONTENT_TYPES).to.deep.equal([
        'text/plain',
        'text/markdown',
        'application/json'
      ]);
      expect(File.ALLOWED_EXTENSIONS).to.deep.equal([
        '.txt',
        '.md',
        '.json'
      ]);
    });
  });
});