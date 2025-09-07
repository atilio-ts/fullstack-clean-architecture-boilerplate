# Generated TypeScript API Client

This directory contains the auto-generated TypeScript API client created from the backend Swagger documentation using `swagger-typescript-api`.

## Files

- **`generated/api-client.ts`** - Auto-generated TypeScript client from backend Swagger specification (DO NOT EDIT MANUALLY)
- **`fileService.ts`** - High-level file operations service with validation and utilities
- **`index.ts`** - Main exports and API client configuration with interceptors
- **`examples.ts`** - Usage examples and React component templates
- **`README.md`** - This documentation file

## Quick Start

### File Operations

```typescript
import { 
  uploadFile, 
  getAllFiles, 
  getFileContent, 
  deleteFile,
  validateFile 
} from '../api';

// Upload a file from file input
const handleUpload = async (file: File) => {
  const validation = validateFile(file);
  if (!validation.valid) {
    alert(validation.error);
    return;
  }
  
  const uploadedFile = await uploadFile(file);
  console.log('File uploaded:', uploadedFile);
};

// List all files
const files = await getAllFiles({ page: 1, limit: 20 });

// Get file content
const fileData = await getFileContent(fileId);

// Delete file
await deleteFile(fileId);
```

### Health Check

```typescript
import { checkHealth, healthApi } from '../api';

// Using the utility function
const healthData = await checkHealth();

// Using the API client directly
const response = await healthApi.getHealth();
console.log(response.data);
```

## File Service Features

The `FileService` provides high-level file operations:

- **File Upload**: From File objects or text content
- **File Validation**: Size limits (1MB) and type checking (.txt, .md, .json)
- **File Management**: List, get content, delete with error handling
- **Download Support**: Browser download with proper MIME types
- **Utility Functions**: File size formatting, content type detection

## Available API Endpoints

### Files
- `POST /files/upload` - Upload file (multipart form data)
- `GET /files` - List all files (with pagination/sorting)
- `GET /files/{fileId}` - Get file content by ID
- `DELETE /files/{fileId}` - Delete file by ID

### Health
- `GET /health` - API health check

## File Upload Requirements

- **File Types**: Only `.txt`, `.md`, `.json` files
- **Size Limit**: Maximum 1MB per file
- **Content Types**: `text/plain`, `text/markdown`, `application/json`

## TypeScript Types

All API types are automatically generated and exported:

```typescript
import type { 
  FileResponse,
  FileListResponse,
  FileContentResponse,
  DeleteFileResponse,
  GetAllFilesParamsSortByEnum,
  GetAllFilesParamsSortOrderEnum,
  HealthResponse
} from '../api';

const handleHealthData = (health: HealthResponse) => {
  console.log(`API Status: ${health.status}`);
  console.log(`Uptime: ${health.uptime} seconds`);
  console.log(`Memory Used: ${health.memory.used} MB`);
};
```

## Advanced Usage

```typescript
import { apiClient, filesApi, Api } from '../api';

// Using the configured client with interceptors
const customRequest = async () => {
  try {
    const response = await filesApi.getAllFiles({ page: 1 });
    return response.data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Creating a new client instance with custom configuration
const customApi = new Api({
  baseURL: 'https://my-custom-api.com/api/v1',
  timeout: 5000,
});
```

## Regenerating the API Client

When the backend Swagger documentation is updated, regenerate the client:

**From Frontend:**
```bash
# Generate client from backend
npm run api:generate-from-backend

# Alternative: generate and run type check  
npm run api:update
```

**From Backend:**
```bash
# Generate Swagger spec and client
npm run build:client
```

## Configuration

The API client is configured in `index.ts` with:

- Base URL from `VITE_API_BASE_URL` environment variable (defaults to `http://localhost:3001/api/v1`)
- 10-second timeout
- Authentication token handling via localStorage
- Automatic token cleanup on 401 responses
- Request/response interceptors

## Authentication

The client automatically includes JWT tokens from localStorage:

```typescript
// Token is automatically added to requests if available
localStorage.setItem('authToken', 'your-jwt-token');

// Requests will include: Authorization: Bearer your-jwt-token
const response = await healthApi.getHealth();
```

## Error Handling

The file service provides proper error handling:

```typescript
try {
  const file = await uploadFile(selectedFile);
} catch (error) {
  // Error messages are user-friendly
  alert(error.message); // "File too large (max 1MB)" etc.
}
```

Built-in error handling:
- 401 responses automatically clear the auth token
- Network errors are propagated with proper TypeScript types
- All responses are properly typed based on the Swagger specification
- File validation errors with helpful messages

## React Integration

See `examples.ts` for complete React component examples showing:

- File upload with validation
- File listing with pagination  
- File deletion with confirmation
- Error handling and loading states

## Development Workflow

1. Backend changes API → Run `npm run build:swagger` in backend
2. Frontend needs update → Run `npm run api:generate-from-backend` in frontend
3. TypeScript will catch any breaking changes automatically

The generated client ensures type safety between frontend and backend!