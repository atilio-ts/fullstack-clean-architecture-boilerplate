# Atilio Frontend

Modern React frontend application built with TypeScript, Vite, and Ant Design. Features comprehensive file management system with auto-generated type-safe API client from backend Swagger documentation.

## 🚀 Tech Stack

- **React 19** - Modern component-based UI library with latest features
- **TypeScript** - Type-safe JavaScript superset with strict configuration
- **Vite** - Lightning-fast build tool and development server
- **Ant Design** - Professional UI component library
- **React Router Dom** - Client-side routing
- **Axios** - HTTP client for API communication
- **swagger-typescript-api** - Auto-generated type-safe API client

## 🛠️ Prerequisites

- **Node.js 22+** (required for Vite compatibility)
- **npm 10+**

## ⚡ Quick Start

### Development Server
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The app will be available at http://localhost:3000
```

### Docker Development
```bash
# From project root
docker-compose up --build

# Frontend will be available at http://localhost:3000
```

## 📁 Project Structure

```
src/
├── api/                          # API Integration Layer
│   ├── generated/               # Auto-generated API client
│   │   └── api-client.ts       # Generated from backend Swagger (DO NOT EDIT)
│   ├── fileService.ts          # High-level file operations service
│   ├── examples.ts             # Usage examples & React templates
│   ├── index.ts                # API client configuration & exports
│   └── README.md               # Complete API integration docs
├── components/                  # Reusable React components
│   └── common/                 # Shared components
│       ├── AppLayout.tsx       # Responsive layout with sidebar
│       └── AppRouter.tsx       # Route configuration
├── pages/                      # Page-level components (templates)
│   ├── Dashboard.tsx          # Dashboard with API health demo
│   ├── Home.tsx               # Landing page template
│   └── Settings.tsx           # Settings form template
├── constants/                  # Application constants
│   └── routes.ts              # Route path definitions
├── styles/                    # Theme and styling
│   └── theme.ts               # Ant Design theme configuration
├── types/                     # TypeScript type definitions
│   └── index.ts               # Global shared types
├── App.tsx                    # Root application component
├── main.tsx                   # Application entry point
└── vite-env.d.ts             # Vite type definitions
```

## 🗂️ File Management System

The frontend includes a complete file management system with full type safety:

### ✨ Features
- **File Upload**: Support for `.txt`, `.md`, and `.json` files (max 1MB)
- **File Operations**: List, view content, download, and delete files
- **Type Safety**: Auto-generated TypeScript client from backend API
- **Validation**: Client and server-side file validation with helpful error messages
- **Pagination**: Efficient file listing with sorting options

### 📡 Available Operations
- `uploadFile()` - Upload files from File objects with validation
- `getAllFiles()` - List files with pagination and sorting
- `getFileContent()` - Get file content by ID
- `deleteFile()` - Delete files by ID
- `triggerDownload()` - Browser download with proper MIME types

### 🔄 Usage Examples
```typescript
import { 
  uploadFile, 
  getAllFiles, 
  validateFile,
  GetAllFilesParamsSortByEnum 
} from '@/api';

// Upload with validation
const handleUpload = async (file: File) => {
  const validation = validateFile(file);
  if (!validation.valid) {
    alert(validation.error);
    return;
  }
  
  const result = await uploadFile(file);
  console.log('Upload successful:', result);
};

// List files with options
const files = await getAllFiles({ 
  page: 1, 
  limit: 20, 
  sortBy: GetAllFilesParamsSortByEnum.Filename,
  sortOrder: GetAllFilesParamsSortOrderEnum.ASC
});
```

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type checking
npm run typecheck

# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# API Client Generation
npm run api:generate-from-backend  # Generate from backend
npm run api:update                 # Generate + type check

# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run
```

## 🌐 Type-Safe API Integration

### Generated API Client
The frontend uses `swagger-typescript-api` to automatically generate a comprehensive type-safe API client from the backend's Swagger documentation.

#### Key Features
- ✅ **Full Type Safety** - Complete TypeScript support for all API calls
- ✅ **Auto-Sync** - Client stays in sync with backend API changes
- ✅ **File Operations** - Complete CRUD operations for file management
- ✅ **Health Monitoring** - Backend health check integration
- ✅ **Error Handling** - Proper error typing and user-friendly messages
- ✅ **Authentication** - JWT token handling built-in (ready for future use)

#### Current API Endpoints
- **Health Check**: `GET /health` - API status and system metrics
- **File Upload**: `POST /files/upload` - Upload files via multipart form data
- **List Files**: `GET /files` - Paginated file listing with sorting
- **Get File**: `GET /files/{id}` - Get file content by ID
- **Delete File**: `DELETE /files/{id}` - Delete file by ID

#### Usage Examples
```typescript
// Health check with utility function
import { checkHealth } from '@/api';
const healthData = await checkHealth();

// File operations
import { FileService } from '@/api';
const result = await FileService.uploadFile(selectedFile);
const files = await FileService.getAllFiles({ page: 1, limit: 10 });

// Direct API client usage
import { filesApi } from '@/api';
const response = await filesApi.getAllFiles({ page: 1 });
```

### API Client Structure
- `src/api/generated/api-client.ts` - **Auto-generated** client (DO NOT EDIT)
- `src/api/fileService.ts` - High-level service layer with validation
- `src/api/index.ts` - Configuration, interceptors, and utilities
- `src/api/examples.ts` - Complete usage examples and React templates
- `src/api/README.md` - Comprehensive usage documentation

### API Client Regeneration
When backend APIs change, regenerate the client:

```bash
# From frontend directory
npm run api:generate-from-backend

# Or from backend directory
cd ../backend && npm run build:client

# Verify no TypeScript errors
npm run typecheck
```

## 🎨 Component Architecture

### Template Components
The project includes well-structured template components:

- **`pages/Home.tsx`** - Landing page with feature cards and navigation
- **`pages/Dashboard.tsx`** - Dashboard with live API health check demo
- **`pages/Settings.tsx`** - Settings form with validation patterns

### Layout Components
- **`AppLayout.tsx`** - Responsive layout with collapsible sidebar
- **`AppRouter.tsx`** - Centralized routing configuration

### Shared Components
Located in `src/components/common/` for reusable UI elements.

## 🎯 TypeScript Configuration

### Type Definitions
- **API types**: Auto-generated from backend Swagger (`src/api/generated/api-client.ts`)
- **File operations**: Comprehensive types for file management
- **Shared types**: Manual definitions in `src/types/index.ts`
- **Component props**: Defined inline or in component files

### Path Aliases
Configured TypeScript/Vite path mappings for cleaner imports:
```typescript
"@/*" → "src/*"
"@/api/*" → "src/api/*" 
"@/components/*" → "src/components/*"
"@/pages/*" → "src/pages/*"
```

## 🎨 Styling & Theming

### Ant Design Integration
- **Theme Configuration**: `src/styles/theme.ts` - Customizable theme settings
- **Global Styles**: `src/index.css` - Base styles and layout fixes
- **Responsive Design**: Mobile, tablet, and desktop breakpoints
- **Full-width Layout**: No artificial width restrictions

## 🚀 Build & Deployment

### Production Build
```bash
npm run build
```
- **Bundle Size**: ~785KB (255KB gzipped) - includes Ant Design
- **Build Time**: ~14 seconds
- **Output**: Optimized files in `dist/` directory

### Performance Metrics
- ✅ **Fast Development**: <1s dev server startup
- ✅ **Type Safety**: <5s TypeScript compilation  
- ✅ **Hot Reload**: Instant updates during development

## 🧪 Code Quality & Standards

### ✅ Current Quality Status (Verified)
- **Zero TypeScript errors** - Strict mode enabled and passing
- **Zero ESLint warnings** - All linting rules pass
- **Clean dependencies** - No unused packages detected
- **Type-safe API calls** - Full end-to-end type safety
- **Modern error handling** - No `any` types, proper error boundaries

### Quality Tools
- **ESLint** - React and TypeScript rules with automatic fixing
- **TypeScript** - Strict type checking with proper error handling  
- **Vite** - Fast build validation and hot reload
- **Build Verification** - Production build tested and working

### Development Guidelines
1. **Type Safety First** - Use TypeScript throughout, avoid `any` types
2. **Use File Service** - Leverage high-level file operations with validation
3. **Follow Templates** - Use existing page components as patterns
4. **Path Aliases** - Use `@/` imports for cleaner code
5. **Error Handling** - Use proper error boundaries and user feedback

## 📊 Template Files & Examples

The project includes comprehensive templates and examples:

### 🎯 **Page Templates**
- **`pages/Home.tsx`** - Feature landing page with navigation
- **`pages/Dashboard.tsx`** - API integration with health monitoring
- **`pages/Settings.tsx`** - Form validation and submission patterns

### 🛠️ **API Integration Templates**
- **`api/examples.ts`** - Complete usage patterns:
  - File upload with validation
  - File listing with pagination
  - Error handling strategies
  - React component integration examples

### 🏗️ **Architecture Examples**  
- **`components/common/`** - Layout and routing patterns
- **`api/fileService.ts`** - Service layer implementation
- **`styles/theme.ts`** - Theme customization approach

## 🔄 Development Workflow

### API Synchronization
1. **Backend Changes** → Run `npm run build:swagger` in backend
2. **Frontend Updates** → Run `npm run api:generate-from-backend` in frontend
3. **Type Safety** → TypeScript automatically catches breaking changes
4. **Development** → Full IntelliSense and error detection

### Quality Assurance
```bash
npm run lint          # Code style verification
npm run typecheck     # Type safety validation  
npm run build        # Production build test
npm run dev          # Development server
```

## 🔍 Troubleshooting

### Common Issues

**API Client Generation Errors**
```bash
# Ensure backend is running and generating swagger
cd ../backend && npm run build:swagger
cd ../frontend && npm run api:generate-from-backend
```

**TypeScript Errors After Regeneration**
```bash
# Clear cache and regenerate
rm -rf node_modules/.cache .vite
npm run api:generate-from-backend
npm run typecheck
```

**Port 3000 Already in Use**  
The dev server automatically finds available ports (3000, 3001, 3002, etc.)

**Build Errors**
```bash
# Clean reinstall
rm -rf node_modules package-lock.json dist
npm install && npm run build
```

## 📚 Resources

### Documentation
- **Local API Docs**: `src/api/README.md` - Complete integration guide
- **Integrity Report**: `INTEGRITY_REPORT.md` - Code quality analysis
- [React 19 Documentation](https://react.dev/) - Latest React patterns
- [Ant Design Components](https://ant.design/components/overview/) - UI library
- [swagger-typescript-api](https://github.com/acacode/swagger-typescript-api) - Client generator

### Project Status
**✅ PRODUCTION READY** - Clean codebase with comprehensive file management, full type safety, and excellent developer experience. All template files serve as valuable development guidelines and should be preserved for future development.