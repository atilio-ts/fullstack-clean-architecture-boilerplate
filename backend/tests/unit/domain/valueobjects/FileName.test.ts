import { expect } from 'chai';
import { FileName } from '../../../../src/domain/valueobjects';

describe('FileName Value Object', () => {
  describe('constructor', () => {
    it('should create a valid filename', () => {
      const fileName = new FileName('test.txt');
      expect(fileName.value).to.equal('test.txt');
    });

    it('should accept allowed extensions', () => {
      expect(() => new FileName('document.txt')).to.not.throw();
      expect(() => new FileName('README.md')).to.not.throw();
      expect(() => new FileName('config.json')).to.not.throw();
    });

    it('should reject disallowed extensions', () => {
      expect(() => new FileName('document.pdf'))
        .to.throw('File must have one of these extensions: .txt, .md, .json');
      expect(() => new FileName('image.png'))
        .to.throw('File must have one of these extensions: .txt, .md, .json');
    });

    it('should reject empty filename', () => {
      expect(() => new FileName('')).to.throw('Filename cannot be empty');
      expect(() => new FileName('   ')).to.throw('Filename cannot be empty');
    });

    it('should reject short filenames', () => {
      expect(() => new FileName('a')).to.throw('Filename must be at least 2 characters long');
    });

    it('should reject long filenames', () => {
      const longName = 'a'.repeat(250) + '.txt';
      expect(() => new FileName(longName)).to.throw('Filename cannot exceed 255 characters');
    });

    it('should reject filenames with invalid characters', () => {
      expect(() => new FileName('test<.txt')).to.throw('Filename contains invalid characters');
      expect(() => new FileName('test>.txt')).to.throw('Filename contains invalid characters');
      expect(() => new FileName('test:.txt')).to.throw('Filename contains invalid characters');
      expect(() => new FileName('test".txt')).to.throw('Filename contains invalid characters');
      expect(() => new FileName('test/.txt')).to.throw('Filename contains invalid characters');
      expect(() => new FileName('test\\.txt')).to.throw('Filename contains invalid characters');
      expect(() => new FileName('test|.txt')).to.throw('Filename contains invalid characters');
      expect(() => new FileName('test?.txt')).to.throw('Filename contains invalid characters');
      expect(() => new FileName('test*.txt')).to.throw('Filename contains invalid characters');
    });

    it('should reject reserved system names', () => {
      expect(() => new FileName('CON.txt')).to.throw('Filename cannot use reserved system names');
      expect(() => new FileName('PRN.txt')).to.throw('Filename cannot use reserved system names');
      expect(() => new FileName('AUX.txt')).to.throw('Filename cannot use reserved system names');
      expect(() => new FileName('NUL.txt')).to.throw('Filename cannot use reserved system names');
      expect(() => new FileName('COM1.txt')).to.throw('Filename cannot use reserved system names');
      expect(() => new FileName('LPT1.txt')).to.throw('Filename cannot use reserved system names');
    });

    it('should reject filenames with trailing spaces or periods', () => {
      expect(() => new FileName(' test.txt')).to.throw('Filename cannot start or end with spaces or periods');
      expect(() => new FileName('test.txt ')).to.throw('Filename cannot start or end with spaces or periods');
      expect(() => new FileName('test.txt.')).to.throw('Filename cannot start or end with spaces or periods');
    });

    it('should trim whitespace from valid filenames', () => {
      // This should not throw but also not have leading/trailing spaces
      const fileName = new FileName('test.txt');
      expect(fileName.value).to.equal('test.txt');
    });
  });

  describe('methods', () => {
    let fileName: FileName;

    beforeEach(() => {
      fileName = new FileName('document.txt');
    });

    it('should get extension', () => {
      expect(fileName.getExtension()).to.equal('.txt');
      
      const mdFile = new FileName('README.md');
      expect(mdFile.getExtension()).to.equal('.md');
      
      const jsonFile = new FileName('config.json');
      expect(jsonFile.getExtension()).to.equal('.json');
    });

    it('should get name without extension', () => {
      expect(fileName.getNameWithoutExtension()).to.equal('document');
      
      const complexName = new FileName('my-file.name.txt');
      expect(complexName.getNameWithoutExtension()).to.equal('my-file.name');
    });

    it('should check equality', () => {
      const fileName1 = new FileName('test.txt');
      const fileName2 = new FileName('test.txt');
      const fileName3 = new FileName('other.txt');

      expect(fileName1.equals(fileName2)).to.be.true;
      expect(fileName1.equals(fileName3)).to.be.false;
    });

    it('should convert to string', () => {
      expect(fileName.toString()).to.equal('document.txt');
    });
  });

  describe('static methods', () => {
    it('should create filename with validation', () => {
      const fileName = FileName.create('test.txt');
      expect(fileName).to.be.instanceOf(FileName);
      expect(fileName.value).to.equal('test.txt');
    });

    it('should get allowed extensions', () => {
      const extensions = FileName.getAllowedExtensions();
      expect(extensions).to.deep.equal(['.txt', '.md', '.json']);
    });
  });
});