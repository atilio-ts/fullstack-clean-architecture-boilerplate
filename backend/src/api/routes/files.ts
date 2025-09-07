import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { FileController } from '../controllers';
import {
  UploadFileUseCase,
  GetAllFilesUseCase,
  GetFileContentUseCase,
  DeleteFileUseCase
} from '../../application/usecases';
import { FileRepository } from '../../infrastructure/repositories';
import { FileStorageService } from '../../infrastructure/services';
import { uploadSingleFile, validateUploadedFile, handleUploadError } from '../middleware';

/**
 * Creates file routes with dependency injection
 */
export function createFileRoutes(pool: Pool): Router {
  const router = Router();
  
  // Initialize services
  const fileStorageService = new FileStorageService();
  const fileRepository = new FileRepository(pool);
  
  // Initialize use cases
  const uploadFileUseCase = new UploadFileUseCase(fileRepository, fileStorageService);
  const getAllFilesUseCase = new GetAllFilesUseCase(fileRepository);
  const getFileContentUseCase = new GetFileContentUseCase(fileRepository, fileStorageService);
  const deleteFileUseCase = new DeleteFileUseCase(fileRepository, fileStorageService);
  
  // Initialize controller
  const fileController = new FileController(
    uploadFileUseCase,
    getAllFilesUseCase,
    getFileContentUseCase,
    deleteFileUseCase
  );

  // Upload file
  router.post('/upload', 
    uploadSingleFile,
    handleUploadError,
    validateUploadedFile,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        // Get file content and metadata
        const content = req.file.buffer.toString('utf8');
        const getContentType = (filename: string): string => {
          const ext = filename.toLowerCase().split('.').pop();
          switch (ext) {
            case 'json': return 'application/json';
            case 'md': return 'text/markdown';
            case 'txt': return 'text/plain';
            default: return 'text/plain';
          }
        };

        const processedFile = {
          filename: req.file.originalname,
          content: content,
          contentType: getContentType(req.file.originalname)
        };

        // Call the controller method
        const result = await fileController.uploadFile(processedFile);
        res.status(201).json(result);
      } catch (error) {
        next(error);
      }
    }
  );

  // Get all files
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, sortBy, sortOrder } = req.query;
      const result = await fileController.getAllFiles(
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined,
        sortBy as 'filename' | 'created_at' | 'file_size' | undefined,
        sortOrder as 'ASC' | 'DESC' | undefined
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Get file content by ID
  router.get('/:fileId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await fileController.getFileContent(req.params.fileId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Delete file by ID
  router.delete('/:fileId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await fileController.deleteFile(req.params.fileId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}