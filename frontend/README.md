# Atilio Frontend

Modern React frontend application built with TypeScript, Vite, and Ant Design. Features auto-generated type-safe API client from backend Swagger documentation.

## 🚀 Tech Stack

- **React 19** - Modern component-based UI library with latest features
- **TypeScript** - Type-safe JavaScript superset with strict configuration
- **Vite** - Fast build tool and development server
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

## 📁 Clean Project Structure

```
src/
├── api/                    # Generated TypeScript API client
│   ├── api.ts             # Auto-generated from Swagger (DO NOT EDIT)
│   ├── index.ts           # API client configuration and utilities
│   └── README.md          # API usage documentation
├── components/            # Reusable React components
│   └── common/           # Shared components
│       ├── AppLayout.tsx # Main application layout with responsive design
│       └── AppRouter.tsx # Route configuration and routing
├── constants/            # Application constants
│   └── routes.ts         # Route path definitions
├── pages/               # Page-level components (templates)
│   ├── Dashboard.tsx    # Dashboard with live API health demo
│   ├── Home.tsx         # Landing page template
│   └── Settings.tsx     # Settings form template
├── styles/              # Theme and styling
│   └── theme.ts         # Ant Design theme configuration
├── types/               # TypeScript type definitions
│   └── index.ts         # Shared types and interfaces
├── App.tsx              # Root application component
├── main.tsx             # Application entry point
└── vite-env.d.ts        # Vite type definitions
```

### Key Features
- ✅ **Clean Architecture** - No unused files or dependencies
- ✅ **Type-Safe API Client** - Auto-generated from backend Swagger docs
- ✅ **Zero Errors** - No TypeScript or ESLint warnings
- ✅ **Modern Patterns** - React 19 with latest best practices

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

# Generate API client from backend Swagger docs
npm run api:generate

# Generate API client and run type check
npm run api:generate-watch

# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run
```

## 🎨 Component Architecture

### Layout Components
- **AppLayout**: Main application layout with navigation
- **AppRouter**: Centralized routing configuration

### Page Components
- **Dashboard**: Main dashboard view
- **Home**: Landing/home page
- **Settings**: Application settings page

### Shared Components
Located in `src/components/common/` for reusable UI elements.

## 🌐 Type-Safe API Integration

### Generated API Client
The frontend uses `swagger-typescript-api` to automatically generate a type-safe API client from the backend's Swagger documentation.

#### Key Benefits
- ✅ **Full Type Safety** - Complete TypeScript support for all API calls
- ✅ **Auto-Sync** - Client stays in sync with backend API changes
- ✅ **IntelliSense** - IDE auto-completion and error detection
- ✅ **Authentication** - JWT token handling built-in
- ✅ **Error Handling** - Automatic 401 logout and error processing

#### Usage Examples
```typescript
// Simple API usage with utility function
import { checkHealth } from '@/api';
const healthData = await checkHealth();

// Direct API client usage with full typing
import { healthApi, type HealthResponse } from '@/api';
const response = await healthApi.getHealth();
console.log(response.data.status); // Fully typed!

// Using the configured client instance
import { apiClient } from '@/api';
const customCall = await apiClient.health.getHealth();
```

#### API Client Structure
- `src/api/api.ts` - **Auto-generated** client (DO NOT EDIT)
- `src/api/index.ts` - Configuration, interceptors, and utilities
- `src/api/README.md` - Comprehensive usage documentation

#### Regeneration Workflow
When backend APIs change:
```bash
# Regenerate the TypeScript client
npm run api:generate

# Or regenerate and type-check in one command
npm run api:generate-watch
```

## 🎯 TypeScript Configuration

### Type Definitions
- **API types**: Auto-generated from Swagger (`src/api/api.ts`)
- **Shared types**: Manual definitions in `src/types/index.ts`
- **Component props**: Defined inline or in component files

### Path Aliases
Configured TypeScript/Vite path mappings for cleaner imports:
```typescript
// Available path aliases
"@/*" → "src/*"
"@/api/*" → "src/api/*"
"@/components/*" → "src/components/*"
"@/pages/*" → "src/pages/*"
"@/types/*" → "src/types/*"
"@/constants/*" → "src/constants/*"
"@/styles/*" → "src/styles/*"
```

### TSConfig Files
- `tsconfig.json`: Main TypeScript configuration references
- `tsconfig.app.json`: Application-specific config with strict mode
- `tsconfig.node.json`: Node.js/build tools config

## 🎨 Styling & Theming

### Ant Design Theme
Custom theme configuration in `src/styles/theme.ts`:
```typescript
import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  // Custom theme configuration
};
```

### CSS Structure
- `src/index.css`: Global base styles
- `src/App.css`: App component styles
- `src/styles/global.css`: Additional global styles

## 🚀 Build & Deployment

### Production Build
```bash
npm run build
```
Creates optimized production build in `dist/` directory.

### Docker Production
The Dockerfile uses multi-stage build:
1. **Development stage**: Node.js with hot reload
2. **Build stage**: Creates production bundle
3. **Production stage**: Nginx serving static files

### Environment Variables
Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

## 🧪 Code Quality & Standards

### Current Quality Status
- ✅ **Zero TypeScript errors** - Strict mode enabled
- ✅ **Zero ESLint warnings** - All linting rules pass
- ✅ **Clean dependencies** - No unused packages
- ✅ **Type-safe API calls** - Full end-to-end type safety

### Quality Tools
- **ESLint** - Code linting with React and TypeScript rules
- **TypeScript** - Strict type checking with exhaustive dependency checks
- **Vite** - Fast build validation and hot reload

### Development Guidelines
1. **Type Safety First** - Use TypeScript throughout, avoid `any` types
2. **Use Generated API Client** - Don't create manual HTTP requests
3. **Follow Existing Patterns** - Look at existing components for guidance
4. **Path Aliases** - Use `@/` imports for cleaner code
5. **Component Focus** - Keep components small and single-purpose

### Quality Scripts
- `npm run lint` - Check code style and formatting
- `npm run lint:fix` - Auto-fix linting issues
- `npm run typecheck` - Validate TypeScript types
- `npm run api:generate-watch` - Regenerate API client with validation

## 🔄 API Client Workflow

### Initial Setup (Already Done)
The project is pre-configured with a working API client generated from your backend's health endpoint.

### When Backend APIs Change
1. **Backend updates** - When new endpoints are added to the backend
2. **Regenerate client** - Run `npm run api:generate` 
3. **Type validation** - TypeScript will catch any breaking changes
4. **Update components** - Add new API calls with full type safety

### Demo Implementation
The **Dashboard** page demonstrates real API integration:
```typescript
// Live example in src/pages/Dashboard.tsx
import { checkHealth, type HealthResponse } from '@/api';

const [healthData, setHealthData] = useState<HealthResponse | null>(null);
const data = await checkHealth(); // Fully typed!
```

### Adding New Endpoints
When backend adds new endpoints:
1. New endpoints automatically available after `npm run api:generate`
2. Import new functions from `@/api` 
3. Full TypeScript support with autocomplete
4. Error handling and authentication built-in

## 🔍 Troubleshooting

### Common Issues

**API Client Generation Errors**
```bash
# If API generation fails, ensure backend is running and swagger.json exists
npm run api:generate

# Check if backend swagger.json is accessible
curl http://localhost:3001/api/v1/docs/swagger.json
```

**TypeScript Errors After API Regeneration**
```bash
# Clear TypeScript cache and regenerate
rm -rf node_modules/.cache
npm run api:generate
npm run typecheck
```

**Node.js Version Error**
```
Error: Vite requires Node.js version 20.19+ or 22.12+
```
**Solution**: Use Node.js 22+ (configured in Docker)

**Port 3000 Already in Use**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
```

**API Connection Issues**
- Ensure backend is running on `http://localhost:3001`
- Check if health endpoint responds: `curl http://localhost:3001/api/v1/health`
- Verify Docker containers are running: `docker-compose ps`

## 📚 Resources

### Documentation
- [React 19 Documentation](https://react.dev/) - Latest React features and patterns
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript language guide
- [Vite Documentation](https://vitejs.dev/) - Fast build tool and dev server
- [Ant Design Components](https://ant.design/components/overview/) - UI component library
- [React Router Documentation](https://reactrouter.com/) - Client-side routing

### API Integration
- [swagger-typescript-api](https://github.com/acacode/swagger-typescript-api) - API client generator
- [Axios Documentation](https://axios-http.com/) - HTTP client library
- **Local API Docs**: `src/api/README.md` - Comprehensive usage guide

### Project Structure
This README contains the complete project documentation. The frontend is clean, optimized, and ready for development with excellent templates and clear patterns to follow.
