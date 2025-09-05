# Atilio Frontend

Modern React frontend application built with TypeScript, Vite, and Ant Design.

## 🚀 Tech Stack

- **React 19** - Modern component-based UI library
- **TypeScript** - Type-safe JavaScript superset
- **Vite** - Fast build tool and development server
- **Ant Design** - Professional UI component library
- **React Router Dom** - Client-side routing
- **Axios** - HTTP client for API communication
- **Day.js** - Modern date manipulation library

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
frontend/src/
├── components/              # Reusable React components
│   └── common/             # Shared components
│       ├── AppLayout.tsx   # Main application layout
│       └── AppRouter.tsx   # Application routing configuration
├── pages/                  # Page-level components
│   ├── Dashboard.tsx       # Dashboard page
│   ├── Home.tsx           # Home page
│   └── Settings.tsx       # Settings page
├── services/              # API communication
│   └── api.ts             # Axios configuration and API services
├── hooks/                 # Custom React hooks
│   └── useApi.ts          # Custom hook for API calls
├── types/                 # TypeScript type definitions
│   └── index.ts           # Shared type definitions
├── styles/                # Styling files
│   ├── global.css         # Global CSS styles
│   └── theme.ts           # Ant Design theme configuration
├── utils/                 # Utility functions
│   └── helpers.ts         # Helper functions
├── constants/             # Application constants
│   └── routes.ts          # Route constants
├── assets/                # Static assets
│   └── react.svg          # React logo
├── App.tsx                # Main App component
├── App.css                # App-specific styles
├── main.tsx               # Application entry point
└── vite-env.d.ts          # Vite environment types
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

## 🌐 API Integration

### API Service
The `src/services/api.ts` file contains:
- Axios configuration
- Base URL configuration
- Request/response interceptors
- API endpoint methods

### Custom Hook
`src/hooks/useApi.ts` provides:
- Reusable API call logic
- Loading state management
- Error handling
- Response caching

Example usage:
```typescript
import { useApi } from '../hooks/useApi';

const MyComponent = () => {
  const { data, loading, error } = useApi('/api/endpoint');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{JSON.stringify(data)}</div>;
};
```

## 🎯 TypeScript Configuration

### Type Definitions
- **Shared types**: `src/types/index.ts`
- **Component props**: Defined inline or in component files
- **API responses**: Defined in service files

### TSConfig Files
- `tsconfig.json`: Main TypeScript configuration
- `tsconfig.app.json`: Application-specific config
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

## 🧪 Testing & Quality

### Code Quality Tools
- **ESLint**: Code linting and style enforcement
- **TypeScript**: Static type checking
- **Vite**: Fast build and hot reload

### Available Scripts
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix auto-fixable linting issues
- `npm run typecheck`: Run TypeScript compiler check

## 🔍 Troubleshooting

### Common Issues

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

## 📚 Resources

- [React 19 Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Ant Design Components](https://ant.design/components/overview/)
- [React Router Documentation](https://reactrouter.com/)
