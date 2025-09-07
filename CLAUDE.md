# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with this repository.

## 🎯 Project Overview

**Atilio** is a full-stack web application built with modern technologies and Clean Architecture principles.

### Tech Stack Summary
- **Backend**: Node.js 22 + TypeScript + Express.js + Clean Architecture
- **Frontend**: React 19 + TypeScript + Vite + Ant Design + swagger-typescript-api
- **Database**: PostgreSQL 15 + Flyway migrations + UUID primary keys
- **Testing**: Mocha + Chai + Sinon + NYC (96 tests, 95%+ coverage)
- **API Integration**: Auto-generated TypeScript clients from Swagger/OpenAPI
- **Documentation**: TSOA-generated Swagger docs + Comprehensive README files
- **Infrastructure**: Docker + Docker Compose
- **Development**: Hot reload, TypeScript checking, ESLint, Path aliases

### Repository Structure
```
atilio-test/
├── backend/                 # Node.js backend with Clean Architecture
│   ├── src/                 # Source code following Clean Architecture
│   ├── tests/               # Comprehensive test suite (96 tests)
│   ├── package.json         # Dependencies & test scripts
│   └── Dockerfile           # Multi-stage container build
├── frontend/                # React frontend application
│   ├── src/                 # React components & services
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── database/                # Database management
│   ├── migrations/          # Flyway SQL migration files
│   ├── conf/                # Flyway configuration
│   └── README.md            # Migration documentation
├── docker-compose.yml       # Development environment
├── docker-compose.prod.yml  # Production environment
├── run.sh / run.bat        # Automated setup scripts
└── README.md               # Comprehensive project documentation
```

## 🔧 Technical Requirements

### Node.js Version
- **Required**: Node.js 22+ (LTS recommended)
- **Reason**: Vite requires Node.js 20.19+ or 22.12+
- **Docker Images**: Both Dockerfiles use `node:22-alpine`

### Port Configuration
- **Frontend**: http://localhost:3000 (Vite dev server)
- **Backend**: http://localhost:3001 (Express.js API)
- **Database**: localhost:5432 (PostgreSQL)
- **Health Check**: http://localhost:3001/api/v1/health

### Service Dependencies
- **Flyway**: Runs database migrations before backend starts
- **Backend**: Waits for successful migrations and database
- **Frontend**: Independent of backend for development

## 🏗️ Backend Architecture

The backend implements Clean Architecture with strict separation of concerns and comprehensive API documentation:

```
┌─────────────────────────────────────────────────────┐
│                 API Layer                           │
│  Controllers → Routes → Middleware → DTOs           │
├─────────────────────────────────────────────────────┤
│              Application Layer                      │
│  Use Cases → Services → Interfaces                 │
├─────────────────────────────────────────────────────┤
│                Domain Layer                         │
│  Entities → Value Objects → Domain Services        │
├─────────────────────────────────────────────────────┤
│            Infrastructure Layer                     │
│  Database → Repositories → External Services       │
└─────────────────────────────────────────────────────┘
```

### Layer Structure
```
backend/src/
├── api/                    # 🌐 API Layer (HTTP interface)
│   ├── controllers/        # HTTP request handlers with TSOA decorators
│   ├── middleware/         # Express middleware
│   ├── routes/            # API route definitions + docs route
│   └── dto/               # Data Transfer Objects for type safety
├── application/           # ⚙️ Application Layer (business workflows)
│   ├── services/          # Application services
│   ├── usecases/          # Use case implementations
│   └── interfaces/        # Repository and service interfaces
├── domain/                # 🏛️ Domain Layer (core business logic)
│   ├── entities/          # Business entities
│   ├── repositories/      # Repository interfaces
│   ├── valueobjects/      # Value objects
│   └── services/          # Domain services
└── infrastructure/        # 🔧 Infrastructure Layer (external concerns)
    ├── database/          # Database connections and migrations
    ├── repositories/      # Repository implementations
    ├── external/          # External service integrations
    └── config/            # Configuration files
```

### Dependency Flow Rules
- **API** → **Application** → **Domain** ← **Infrastructure**
- **Domain layer** is completely independent (no external dependencies)
- **Infrastructure** implements domain interfaces
- **Application** orchestrates domain logic and infrastructure
- **API** handles HTTP concerns and delegates to application layer

### Development Guidelines

#### When implementing new features, follow this sequence:

1. **🏛️ Domain First**: 
   - Define business entities in `domain/entities/`
   - Create value objects in `domain/valueobjects/`
   - Define repository interfaces in `domain/repositories/`

2. **⚙️ Application Layer**:
   - Create use cases in `application/usecases/`
   - Define service interfaces in `application/interfaces/`
   - Implement application services in `application/services/`

3. **🔧 Infrastructure Implementation**:
   - Implement repository interfaces in `infrastructure/repositories/`
   - Add database configurations in `infrastructure/config/`
   - Integrate external services in `infrastructure/external/`

4. **🌐 API Exposure**:
   - Create controllers in `api/controllers/` with TSOA decorators
   - Define routes in `api/routes/`
   - Add DTOs in `api/dto/` for request/response validation
   - Configure middleware in `api/middleware/`
   - Update `tsoa.json` configuration for Swagger generation
   - Run `npm run build:swagger` to generate API documentation

## 🧪 Testing Framework

The backend includes a comprehensive testing suite with 96 tests achieving 100% code coverage.

### Testing Stack
- **Mocha**: Test runner with flexible configuration
- **Chai**: BDD/TDD assertion library  
- **Sinon**: Mocking and stubbing framework
- **NYC**: Code coverage with 80%+ requirement
- **Supertest**: HTTP integration testing

### Test Structure
```
backend/tests/
├── architecture/           # Clean Architecture validation
│   └── clean-architecture.test.ts
├── unit/                  # Unit tests for individual components
│   ├── api/controllers/   # Controller tests
│   ├── domain/entities/   # Entity logic tests
│   └── infrastructure/    # Infrastructure tests
├── integration/           # Integration and API tests
│   ├── api/routes/       # Route integration tests
│   └── app.test.ts       # Application-wide tests
├── setup.ts              # Test environment setup
└── mocha.env.js          # Test environment configuration
```

### Test Commands
```bash
# Run all tests with coverage
npm test

# Run specific test categories
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:architecture  # Architecture validation only

# Development testing
npm run test:watch         # Watch mode for TDD
npm run test:coverage      # Generate coverage report
```

### Coverage Requirements
- **Statements**: 80%+ required, currently 95%+
- **Branches**: 80%+ required, currently 95%+  
- **Functions**: 80%+ required, currently 95%+
- **Lines**: 80%+ required, currently 95%+

### Architecture Validation
The test suite includes automated validation of Clean Architecture principles:
- ✅ Layer dependency rules enforcement
- ✅ File naming conventions
- ✅ Directory structure validation
- ✅ Import/export pattern verification

## 🎨 Frontend Architecture

### Technology Stack
- **React 19**: Modern component-based UI library
- **TypeScript**: Type safety and better developer experience
- **Vite**: Fast build tool and development server with path aliases (@/)
- **Ant Design**: Professional UI component library
- **React Router**: Client-side routing
- **swagger-typescript-api**: Auto-generated TypeScript API clients
- **Axios**: HTTP client with authentication and error interceptors

### Project Structure
```
frontend/src/
├── api/                  # Auto-generated API client integration
│   ├── api.ts           # Generated TypeScript API client from Swagger
│   └── index.ts         # API client configuration with interceptors
├── components/            # Reusable React components
│   └── common/           # Shared components across the app
│       ├── AppLayout.tsx # Responsive layout with sidebar navigation
│       └── AppRouter.tsx # Route configuration and routing
├── pages/                # Page-level components
│   ├── Home.tsx          # Landing page with feature cards
│   ├── Dashboard.tsx     # Main dashboard interface with API integration
│   └── Settings.tsx      # Application settings
├── services/             # API communication services
├── hooks/                # Custom React hooks (useApi, etc.)
├── types/                # TypeScript type definitions
├── styles/               # CSS and theme files
│   ├── global.css        # Global styles and layout fixes
│   └── theme.ts          # Ant Design theme configuration
├── utils/                # Utility functions
└── constants/            # Application constants
    └── routes.ts         # Route path constants
```

### Layout Features
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Fixed Sidebar**: Collapsible navigation with smooth transitions
- **Full-Width Layout**: No artificial width restrictions (previous 1280px limit removed)
- **Mobile Optimization**: Auto-collapse sidebar on mobile devices (≤768px)
- **Sticky Header**: Persistent header with navigation controls

### API Integration Workflow
- **Auto-Generated Clients**: TypeScript API clients generated from backend Swagger specs
- **Type Safety**: Full type safety for API requests and responses
- **Error Handling**: Centralized error handling with interceptors
- **Authentication**: Built-in authentication token management
- **Development Workflow**: `npm run api:generate` to regenerate clients from backend changes

## 🐳 Docker Configuration

### Container Architecture
- **Frontend Container**: `node:22-alpine` → Vite dev server (port 3000)
- **Backend Container**: `node:22-alpine` → Express.js API (port 3001) 
- **Database Container**: `postgres:15-alpine` → PostgreSQL (port 5432)
- **Flyway Container**: `flyway:10-alpine` → Database migrations (runs once, then exits)

### Docker Compose Configuration
- **Development**: `docker-compose.yml` with hot reload volumes and development settings
- **Production**: `docker-compose.prod.yml` with optimized builds and Nginx serving
- **Consistent Flyway Version**: Both environments use `flyway:10-alpine` for migration consistency
- **Service Dependencies**: Backend waits for successful migrations before starting

### Environment Files
- `backend/.env.example` → Copy to `backend/.env` for local development
- `frontend/.env.example` → Copy to `frontend/.env` if needed

## 🚀 Development Workflow

### Quick Start
```bash
# Option 1: Automated setup (recommended)
./run.sh          # Unix/Linux/macOS
run.bat           # Windows

# Option 2: Manual Docker setup
docker-compose up --build
```

### Development Commands

#### Essential Commands
```bash
# Start all services
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Check service status
docker-compose ps
```

#### Service-Specific Commands
```bash
# Backend development
cd backend
npm run dev          # Start with hot reload
npm run typecheck    # Type checking
npm run build        # Build for production
npm run build:swagger # Generate Swagger documentation
npm test            # Run comprehensive test suite (96 tests)
npm run test:watch   # TDD development with watch mode

# Frontend development  
cd frontend
npm run dev          # Start Vite dev server
npm run lint         # Check code style
npm run typecheck    # Type checking
npm run build        # Build for production
npm run api:generate # Generate TypeScript API client from backend Swagger
```

## 🗄️ Database Management

### Flyway Migration System

The project uses **Flyway** for database schema management with PostgreSQL.

#### Database Services
- **PostgreSQL**: Main database server (port 5432)
- **Flyway**: Migration management service
- **Dependencies**: Backend waits for successful migrations before starting

#### Migration Structure
```
database/
├── migrations/           # Flyway SQL migration files (production-ready)
│   ├── V1__Initial_schema.sql    # Users table with UUID primary keys
│   └── V2__Add_sample_data.sql   # 3 development users for testing
├── conf/                # Flyway configuration with validation rules
│   └── flyway.conf             # Production-ready migration settings
└── README.md            # Comprehensive database workflow documentation
```

#### Development Workflow

**Automatic Migrations** (Recommended):
```bash
docker-compose up --build   # Runs migrations automatically
```

**Manual Migration Commands**:
```bash
cd backend

# Run pending migrations
npm run db:migrate

# Check migration status
npm run db:info

# Validate migration files
npm run db:validate
```

#### Creating New Migrations

1. **Create migration file**:
   ```bash
   # Follow naming: V{version}__{description}.sql
   touch database/migrations/V3__Add_posts_table.sql
   ```

2. **Write SQL statements**:
   ```sql
   -- V3__Add_posts_table.sql
   -- Add posts table for blog functionality
   CREATE TABLE posts (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       title VARCHAR(255) NOT NULL,
       content TEXT,
       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
       published BOOLEAN DEFAULT false,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Add indexes for common queries
   CREATE INDEX idx_posts_user_id ON posts(user_id);
   CREATE INDEX idx_posts_published ON posts(published);
   ```

3. **Test migration**:
   ```bash
   docker-compose down -v    # Reset database
   docker-compose up --build # Apply all migrations
   ```

#### Migration Best Practices

- ✅ **Never modify existing migrations** once applied to any environment
- ✅ **Use sequential versioning**: V1, V2, V3, V2_1, etc.
- ✅ **Descriptive names**: `V3__Add_user_roles_table.sql`
- ✅ **Test thoroughly** on development before production
- ✅ **Keep migrations atomic** and focused on single changes

For comprehensive database documentation, see `database/README.md`.

## 🧪 Testing & Quality

### Available Scripts
- **Backend**: `npm run typecheck` (TypeScript validation)
- **Frontend**: `npm run lint`, `npm run typecheck`
- **Docker**: Health checks configured for all services

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and TypeScript
- **File Naming**: camelCase for functions, PascalCase for components
- **Architecture**: Follow Clean Architecture principles strictly

## 🎯 Development Best Practices

### When Adding New Features

1. **Start with Domain**: Define business entities and rules
2. **Interface Design**: Create abstractions before implementations
3. **Type Safety**: Use TypeScript for all new code
4. **Component Structure**: Keep components focused and reusable
5. **Error Handling**: Implement proper error boundaries and validation
6. **Documentation**: Update relevant documentation

### Code Organization Principles

- **Single Responsibility**: Each class/function has one reason to change
- **Dependency Inversion**: Depend on abstractions, not concretions
- **Clean Code**: Self-documenting code with meaningful names
- **Consistency**: Follow established patterns in the codebase

## 📊 Current Project Status (September 2025)

### ✅ Completed Features

**Backend Infrastructure**:
- ✅ Clean Architecture implementation with 4 distinct layers
- ✅ Express.js API with health endpoints (`/api/v1/health`)
- ✅ TSOA-generated Swagger documentation (`/api/v1/docs`)
- ✅ TypeScript configuration with strict mode and zero `any` types
- ✅ Docker containerization with Node.js 22
- ✅ PostgreSQL integration with proper configuration

**Database Management**:
- ✅ Flyway migration system fully operational
- ✅ Migration files: V1 (Initial schema), V2 (Sample data)  
- ✅ Automatic migration execution on startup
- ✅ Manual migration commands via npm scripts

**Testing Framework**:
- ✅ Comprehensive test suite with 96 tests
- ✅ 100% code coverage across all metrics
- ✅ Architecture validation tests
- ✅ Unit, integration, and API tests
- ✅ Mocha + Chai + Sinon + NYC setup

**Frontend Implementation**:
- ✅ React 19 + TypeScript + Vite setup with path aliases (@/)
- ✅ swagger-typescript-api integration for type-safe API calls
- ✅ Auto-generated TypeScript clients from backend Swagger specs
- ✅ Ant Design UI components with fixed icon imports
- ✅ Responsive layout with collapsible sidebar
- ✅ Mobile-optimized navigation (≤768px breakpoint)
- ✅ Full-width layout (removed 1280px restriction)
- ✅ React Router with proper navigation
- ✅ Real API integration demonstrated in Dashboard component

**Development Workflow**:
- ✅ Docker Compose orchestration
- ✅ Hot reload for both frontend and backend
- ✅ Automated setup scripts (run.sh/run.bat)
- ✅ Service dependency management
- ✅ Environment configuration templates

### 🚧 Current Architecture State

**Service Status**:
- **Frontend**: ✅ Running on http://localhost:3000
- **Backend**: ✅ Running on http://localhost:3001
- **Database**: ✅ PostgreSQL 15 on port 5432
- **Migrations**: ✅ Flyway successfully applied

**Code Quality**:
- **Backend Tests**: ✅ 96/96 passing (95%+ coverage) with architecture validation
- **Frontend**: ✅ Zero TypeScript errors, zero ESLint warnings
- **API Integration**: ✅ Type-safe communication between frontend and backend
- **TypeScript**: ✅ Strict mode enabled across all projects
- **Docker**: ✅ Multi-container setup with consistent Flyway versions
- **Documentation**: ✅ Comprehensive README files for all components

### 🎯 Ready for Next Development

The project is now in an excellent state for continued development with:
- **Solid architectural foundation** with Clean Architecture and SOLID principles
- **Comprehensive testing coverage** (96 tests, 95%+ coverage, architecture validation)
- **Type-safe API integration** with auto-generated TypeScript clients
- **Production-ready database** with UUID primary keys and proper migrations
- **Full development environment** with Docker, hot reload, and automated setup
- **Zero technical debt** after comprehensive integrity checks across all components
- **Complete documentation** for efficient development workflow

### 🧹 Recent Integrity Improvements (September 2025)

**Frontend Cleanup**:
- ✅ Integrated swagger-typescript-api for type-safe API calls
- ✅ Fixed Ant Design icon imports (MemoryOutlined → DatabaseOutlined)
- ✅ Eliminated all `any` types and TypeScript errors
- ✅ Added path aliases (@/) for cleaner imports
- ✅ Updated comprehensive README with API workflow

**Backend Cleanup**:
- ✅ Achieved 96/96 tests passing with 95%+ coverage
- ✅ Zero TypeScript errors with strict mode enabled
- ✅ Clean Architecture validation automated in tests
- ✅ TSOA-generated Swagger documentation
- ✅ Updated comprehensive README with development workflow

**Database Cleanup**:
- ✅ Removed deprecated `init.sql.deprecated` file
- ✅ Validated migration integrity (V1, V2 applied successfully)
- ✅ Production-ready schema with UUID primary keys and indexes
- ✅ Complete workflow documentation with migration patterns

**Root Directory Cleanup**:
- ✅ Fixed Docker Compose Flyway version consistency (`flyway:10-alpine`)
- ✅ Removed outdated `run.sh.backup` file
- ✅ Updated README.md with correct health endpoint URLs
- ✅ Added API documentation endpoint references
- ✅ Validated all configuration files

## 🔍 Troubleshooting Common Issues

### Node.js Version Issues
- **Error**: `crypto.hash is not a function` or Vite version errors
- **Solution**: Ensure Docker images use `node:22-alpine` (already configured)

### Port Conflicts
- **Error**: `Port already in use`
- **Solution**: `docker-compose down` then restart services

### Database Connection Issues  
- **Error**: Connection refused to database
- **Solution**: `docker-compose down -v db && docker-compose up -d db`

## 🎯 Important Instructions for Claude Code

### General Guidelines
- **Always** follow Clean Architecture principles when modifying backend code
- **Prefer** editing existing files over creating new ones unless absolutely necessary
- **Never** create documentation files unless explicitly requested
- **Always** use TypeScript for new code
- **Focus** on the specific task requested without unnecessary additions

### When Working with Backend Code
1. Identify which layer the change belongs to
2. Start with domain layer if adding new business logic
3. Create interfaces before implementations
4. Implement in infrastructure layer last
5. Add API endpoints only after business logic is complete

### When Working with Frontend Code
1. Follow React best practices and hooks patterns
2. Use Ant Design components when possible
3. Maintain type safety with TypeScript
4. Keep components small and focused
5. Use established patterns from existing components
6. **API Integration**: Use auto-generated API clients from `src/api/` 
7. **Type Safety**: Leverage generated TypeScript interfaces from backend
8. **Path Aliases**: Use `@/` imports for cleaner code organization

### Testing & Validation
- **Backend**: Run `npm test` for full test suite with coverage (96 tests, 95%+)
- **Backend**: Use `npm run test:watch` for TDD development
- **Backend**: Always run `npm run typecheck` after TypeScript changes
- **Backend**: Run `npm run build:swagger` to update API documentation
- **Frontend**: Use `npm run lint` and `npm run typecheck` for code quality
- **Frontend**: Run `npm run api:generate` after backend API changes
- **Integration**: Test Docker setup with `docker-compose up --build` after changes
- **Database**: Verify migrations with `npm run db:info` and `npm run db:validate`
- **Health Check**: Verify http://localhost:3001/api/v1/health is accessible
- **API Documentation**: Check http://localhost:3001/api/v1/docs for Swagger UI

## 📝 Git Commit Guidelines

When asked for git commit messages, use **concise format**:
- **Structure**: `type: brief summary - key changes only`
- **Length**: Maximum 1-4 bullet points for details
- **Focus**: Main changes and critical fixes only
- **Template**:
  ```
  type: brief summary of main change
  
  - Key change 1
  - Key change 2 (if needed)
  - Critical fix (if applicable)
  
  🤖 Generated with [Claude Code](https://claude.ai/code)
  
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

Remember: This project prioritizes **clean architecture**, **type safety**, and **maintainable code** over quick solutions.