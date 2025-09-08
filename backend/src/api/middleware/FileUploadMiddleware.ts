import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { File } from '../../domain/entities';

/**
 * File upload validation and processing middleware
 * Validates file types, sizes, and content before processing
 */

// Configure multer for memory storage (we'll handle disk storage ourselves)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: File.MAX_FILE_SIZE, // 1MB limit
    files: 1, // Only allow one file at a time
  },
  fileFilter: (req, file, cb) => {
    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = File.ALLOWED_EXTENSIONS;

    if (!allowedExtensions.includes(ext as any)) {
      return cb(new Error(`Only ${allowedExtensions.join(', ')} files are allowed`));
    }

    // Check MIME type
    const allowedMimeTypes = [
      'text/plain',
      'text/markdown',
      'application/json',
      'text/x-markdown', // Alternative markdown MIME type
      'application/x-json', // Alternative JSON MIME type
      'application/octet-stream' // Generic binary type (sometimes used for unknown files)
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type. Expected text/plain, text/markdown, or application/json`));
    }

    cb(null, true);
  }
});

/**
 * Single file upload middleware
 */
export const uploadSingleFile = upload.single('file');

/**
 * File validation middleware that runs after multer
 */
export const validateUploadedFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided. Please upload a file using the "file" field.'
      });
    }

    // Validate filename
    if (!req.file.originalname || req.file.originalname.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid filename provided'
      });
    }

    // Check file size (double-check after multer)
    if (req.file.size > File.MAX_FILE_SIZE) {
      return res.status(413).json({
        error: `File too large. Maximum size is ${File.MAX_FILE_SIZE} bytes (1MB)`
      });
    }

    // Check if file is empty
    if (req.file.size === 0) {
      return res.status(400).json({
        error: 'Cannot upload empty files'
      });
    }

    // Validate file content based on extension
    const ext = path.extname(req.file.originalname).toLowerCase();
    const content = req.file.buffer.toString('utf-8');

    if (ext === '.json') {
      try {
        JSON.parse(content);
      } catch (error) {
        return res.status(400).json({
          error: 'Invalid JSON file content'
        });
      }
    }

    // Add processed file data to request for controller
    req.body.processedFile = {
      filename: req.file.originalname,
      content: content,
      size: req.file.size,
      contentType: getContentTypeFromExtension(req.file.originalname)
    };

    next();
  } catch (error) {
    return res.status(400).json({
      error: `File validation failed: ${(error as Error).message}`
    });
  }
};

/**
 * Helper function to get content type from file extension
 */
function getContentTypeFromExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  
  switch (ext) {
    case '.json':
      return 'application/json';
    case '.md':
      return 'text/markdown';
    case '.txt':
    default:
      return 'text/plain';
  }
}

/**
 * Error handling middleware for multer errors
 */
export const handleUploadError = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(413).json({
          error: `File too large. Maximum size is ${File.MAX_FILE_SIZE} bytes (1MB)`
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          error: 'Too many files. Please upload only one file at a time'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          error: 'Unexpected file field. Please use the "file" field name'
        });
      default:
        return res.status(400).json({
          error: `Upload error: ${error.message}`
        });
    }
  }

  // Handle custom validation errors
  if (error.message.includes('Only') && error.message.includes('files are allowed')) {
    return res.status(400).json({
      error: error.message
    });
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: error.message
    });
  }

  // Pass other errors to default error handler
  next(error);
};