import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';

describe('Clean Architecture Validation', () => {
  const srcPath = path.resolve(__dirname, '../../src');
  
  describe('Directory Structure', () => {
    it('should have all required architectural layers', () => {
      const requiredDirs = ['api', 'application', 'domain', 'infrastructure'];
      
      requiredDirs.forEach(dir => {
        const dirPath = path.join(srcPath, dir);
        expect(fs.existsSync(dirPath), `${dir} directory should exist`).to.be.true;
        expect(fs.statSync(dirPath).isDirectory(), `${dir} should be a directory`).to.be.true;
      });
    });

    it('should have proper subdirectories in each layer', () => {
      // API layer structure
      const apiPath = path.join(srcPath, 'api');
      const apiSubdirs = ['controllers'];
      apiSubdirs.forEach(subdir => {
        expect(fs.existsSync(path.join(apiPath, subdir))).to.be.true;
      });

      // Application layer structure
      const appPath = path.join(srcPath, 'application');
      const appSubdirs = ['interfaces'];
      appSubdirs.forEach(subdir => {
        expect(fs.existsSync(path.join(appPath, subdir))).to.be.true;
      });

      // Domain layer structure
      const domainPath = path.join(srcPath, 'domain');
      const domainSubdirs = ['entities'];
      domainSubdirs.forEach(subdir => {
        expect(fs.existsSync(path.join(domainPath, subdir))).to.be.true;
      });

      // Infrastructure layer structure
      const infraPath = path.join(srcPath, 'infrastructure');
      const infraSubdirs = ['config'];
      infraSubdirs.forEach(subdir => {
        expect(fs.existsSync(path.join(infraPath, subdir))).to.be.true;
      });
    });
  });

  describe('File Naming Conventions', () => {
    it('should have controllers ending with Controller.ts in api layer', () => {
      const controllersPath = path.join(srcPath, 'api/controllers');
      if (fs.existsSync(controllersPath)) {
        const files = fs.readdirSync(controllersPath);
        const controllerFiles = files.filter(file => 
          file.endsWith('.ts') && 
          file !== 'index.ts' && 
          !file.startsWith('Base')
        );
        
        controllerFiles.forEach(file => {
          expect(file).to.match(/Controller\.ts$/, `${file} should end with Controller.ts`);
        });
      }
    });

    it('should have entities ending with .ts in domain layer', () => {
      const entitiesPath = path.join(srcPath, 'domain/entities');
      if (fs.existsSync(entitiesPath)) {
        const files = fs.readdirSync(entitiesPath);
        const entityFiles = files.filter(file => 
          file.endsWith('.ts') && 
          file !== 'index.ts'
        );
        
        entityFiles.forEach(file => {
          expect(file).to.match(/\.ts$/, `${file} should be a TypeScript file`);
          // Entities should use PascalCase
          const fileName = file.replace('.ts', '');
          expect(fileName.charAt(0)).to.match(/[A-Z]/, `${file} should start with uppercase letter`);
        });
      }
    });

    it('should have interfaces starting with I in application/interfaces', () => {
      const interfacesPath = path.join(srcPath, 'application/interfaces');
      if (fs.existsSync(interfacesPath)) {
        const files = fs.readdirSync(interfacesPath);
        const interfaceFiles = files.filter(file => 
          file.endsWith('.ts') && 
          file !== 'index.ts'
        );
        
        interfaceFiles.forEach(file => {
          const fileName = file.replace('.ts', '');
          expect(fileName).to.match(/^I[A-Z]/, `${file} should start with 'I' followed by uppercase letter`);
        });
      }
    });
  });

  describe('Layer Dependencies', () => {
    it('should not have domain layer importing from other layers', async () => {
      const domainPath = path.join(srcPath, 'domain');
      const violations = await checkImportViolations(domainPath, [
        '../api',
        '../application', 
        '../infrastructure'
      ]);
      
      expect(violations.length).to.equal(0, 
        `Domain layer should not import from other layers. Violations: ${violations.join(', ')}`
      );
    });

    it('should not have application layer importing from api layer', async () => {
      const applicationPath = path.join(srcPath, 'application');
      const violations = await checkImportViolations(applicationPath, ['../api']);
      
      expect(violations.length).to.equal(0,
        `Application layer should not import from API layer. Violations: ${violations.join(', ')}`
      );
    });

    it('should not have infrastructure layer importing from api layer', async () => {
      const infrastructurePath = path.join(srcPath, 'infrastructure');
      const violations = await checkImportViolations(infrastructurePath, ['../api']);
      
      expect(violations.length).to.equal(0,
        `Infrastructure layer should not import from API layer. Violations: ${violations.join(', ')}`
      );
    });
  });

  describe('Base Classes', () => {
    it('should have BaseEntity in domain/entities', () => {
      const baseEntityPath = path.join(srcPath, 'domain/entities/BaseEntity.ts');
      expect(fs.existsSync(baseEntityPath)).to.be.true;
    });

    it('should have BaseController in api/controllers', () => {
      const baseControllerPath = path.join(srcPath, 'api/controllers/BaseController.ts');
      expect(fs.existsSync(baseControllerPath)).to.be.true;
    });
  });

  describe('Index Files', () => {
    it('should have index.ts files for proper exports', () => {
      const requiredIndexFiles = [
        'api/controllers/index.ts',
        'application/interfaces/index.ts',
        'domain/entities/index.ts',
        'infrastructure/config/index.ts'
      ];

      requiredIndexFiles.forEach(indexFile => {
        const fullPath = path.join(srcPath, indexFile);
        expect(fs.existsSync(fullPath), `${indexFile} should exist for proper module exports`).to.be.true;
      });
    });
  });
});

// Helper function to check import violations
async function checkImportViolations(layerPath: string, forbiddenImports: string[]): Promise<string[]> {
  const violations: string[] = [];
  
  if (!fs.existsSync(layerPath)) {
    return violations;
  }

  const files = getAllTsFiles(layerPath);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, lineNumber) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('import ') || trimmedLine.startsWith('export ')) {
        forbiddenImports.forEach(forbiddenImport => {
          if (trimmedLine.includes(forbiddenImport)) {
            violations.push(`${file}:${lineNumber + 1} - ${trimmedLine}`);
          }
        });
      }
    });
  }
  
  return violations;
}

// Helper function to get all TypeScript files recursively
function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllTsFiles(fullPath));
    } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}