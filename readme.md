# Atilio Project

A full-stack application built with modern web technologies using Clean Architecture principles.

## 🚀 Tech Stack

### Backend
- **Node.js 22** - JavaScript runtime
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web application framework
- **Clean Architecture** - Layered architecture pattern
- **PostgreSQL** - Relational database
- **Docker** - Containerization

### Frontend  
- **React 19** - Modern UI library
- **TypeScript** - Strict type safety
- **Vite** - Lightning-fast build tool and dev server
- **Ant Design** - Professional UI component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Auto-Generated API Client** - Type-safe client from backend Swagger

### Infrastructure
- **Docker Compose** - Multi-container orchestration
- **PostgreSQL 15** - Database server
- **Nginx** - Production web server

## 🛠️ Prerequisites
- **Node.js 22+** (required for Vite compatibility)
- **npm 10+**
- **Docker & Docker Compose**
- **Git**

### Running the Application

#### Option 1: Automated Setup (Recommended)

**For Unix/Linux/macOS:**
```bash
./run.sh
```

**For Windows:**
```batch
run.bat
```

The scripts will:
1. ✅ Check system prerequisites (Node.js, npm, Docker)
2. ✅ Validate Node.js version (22+)
3. ✅ Setup environment files (.env)
4. ✅ Install backend dependencies
5. ✅ Initialize frontend (if needed)
6. ✅ Start Docker services (database, backend, frontend)
7. ✅ Provide health checks and service status
8. ✅ Option to view logs

#### Option 2: Manual Setup

1. **Environment Setup:**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env  # if exists
   ```

2. **Install Dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install  # if frontend exists
   ```

3. **Start Services:**
   ```bash
   docker-compose up --build
   ```

### 🌐 Application URLs

- **Frontend:** http://localhost:3000 - React application
- **Backend API:** http://localhost:3001 - Express.js API server
- **Health Check:** http://localhost:3001/api/v1/health - Backend health endpoint
- **API Docs:** http://localhost:3001/api/v1/docs - Swagger documentation
- **Database:** localhost:5432 - PostgreSQL database server

## 🗂️ File Management System

This application includes a comprehensive file management system with the following features:

### ✨ Features
- **File Upload**: Support for `.txt`, `.md`, and `.json` files (max 1MB)
- **File Operations**: List, view content, download, and delete files
- **Type Safety**: Auto-generated TypeScript client from backend API
- **Validation**: Client and server-side file validation
- **Pagination**: Efficient file listing with sorting options

### 📡 API Endpoints
- `POST /api/v1/files/upload` - Upload files via multipart form data
- `GET /api/v1/files` - List all files with pagination/sorting
- `GET /api/v1/files/{id}` - Get file content by ID
- `DELETE /api/v1/files/{id}` - Delete file by ID

### 🔄 API Client Generation
The frontend automatically generates a TypeScript client from the backend's Swagger specification:

```bash
# Generate API client from backend
cd frontend && npm run api:generate-from-backend

# Or from backend directory
cd backend && npm run build:client
```

### 📊 Service Status

After starting the services, you can verify they're running:

```bash
# Check all containers
docker-compose ps

# Check logs
docker-compose logs -f

# Check backend health
curl http://localhost:3001/api/v1/health

# Check frontend is serving
curl http://localhost:3000
```

## 🗄️ Database Management

This project uses **Flyway** for database migration management with PostgreSQL.

### Migration Commands

```bash
# Run migrations (automatic on docker-compose up)
cd backend && npm run db:migrate

# Check migration status  
cd backend && npm run db:info

# Validate migrations
cd backend && npm run db:validate
```

### Creating New Migrations

1. Create a new migration file in `database/migrations/`:
   ```bash
   # Example: V3__Add_posts_table.sql
   touch database/migrations/V3__Add_posts_table.sql
   ```

2. Follow Flyway naming convention:
   - **Versioned**: `V{version}__{description}.sql`
   - **Repeatable**: `R__{description}.sql`

3. Write SQL statements:
   ```sql
   -- V3__Add_posts_table.sql
   CREATE TABLE posts (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       title VARCHAR(255) NOT NULL,
       content TEXT,
       user_id UUID NOT NULL REFERENCES users(id),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

4. Test migration:
   ```bash
   docker-compose down -v  # Reset database
   docker-compose up --build  # Apply all migrations
   ```

### Migration Rules

- ✅ **Never modify existing migration files** once applied
- ✅ **Always increment version numbers** (V1, V2, V2_1, etc.)
- ✅ **Use descriptive names** for clarity
- ✅ **Test on development first** before production
- ✅ **Keep migrations atomic** and reversible

For detailed information, see `database/README.md`.

## 📁 Project Structure

```
atilio-test/
├── backend/                     # Node.js backend with Clean Architecture
│   ├── src/
│   │   ├── api/                # API Layer (HTTP interface)
│   │   │   ├── controllers/    # Request handlers
│   │   │   ├── routes/         # Route definitions
│   │   │   ├── middleware/     # Express middleware
│   │   │   └── dto/           # Data Transfer Objects
│   │   ├── application/        # Application Layer (business workflows)
│   │   │   ├── services/      # Application services
│   │   │   ├── usecases/      # Use case implementations
│   │   │   └── interfaces/    # Repository & service interfaces
│   │   ├── domain/            # Domain Layer (core business logic)
│   │   │   ├── entities/      # Business entities
│   │   │   ├── repositories/  # Repository interfaces
│   │   │   ├── valueobjects/ # Value objects
│   │   │   └── services/      # Domain services
│   │   ├── infrastructure/    # Infrastructure Layer (external concerns)
│   │   │   ├── database/      # DB connections & migrations
│   │   │   ├── repositories/  # Repository implementations
│   │   │   ├── external/      # External service integrations
│   │   │   └── config/        # Configuration files
│   │   └── server.ts          # Application entry point
│   ├── .env.example           # Environment template
│   ├── Dockerfile             # Container definition
│   ├── tsconfig.json          # TypeScript configuration
│   └── package.json           # Dependencies & scripts
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── api/              # API integration layer
│   │   │   ├── generated/    # Auto-generated API client
│   │   │   ├── fileService.ts # High-level file operations
│   │   │   ├── examples.ts   # Usage examples & templates
│   │   │   ├── index.ts      # API client configuration
│   │   │   └── README.md     # API integration docs
│   │   ├── components/       # React components
│   │   │   └── common/       # Shared components (layout, router)
│   │   ├── pages/           # Page components (Home, Dashboard, Settings)
│   │   ├── types/           # Global TypeScript types
│   │   ├── styles/          # CSS & Ant Design theme
│   │   └── constants/       # App constants (routes, etc.)
│   ├── public/              # Static assets
│   ├── .env.example         # Environment template
│   ├── Dockerfile           # Container definition
│   ├── nginx.conf           # Production server config
│   ├── vite.config.ts       # Vite configuration
│   ├── tsconfig.json        # TypeScript configuration
│   ├── INTEGRITY_REPORT.md  # Frontend code quality report
│   └── package.json         # Dependencies & scripts
├── database/                  # Database setup & migrations
│   ├── migrations/           # Flyway migration files
│   │   ├── V1__Initial_schema.sql
│   │   └── V2__Add_sample_data.sql
│   ├── conf/                 # Flyway configuration
│   │   └── flyway.conf
│   └── README.md             # Database documentation
├── docker-compose.yml         # Development environment
├── docker-compose.prod.yml    # Production environment
├── run.sh                     # Unix setup script
├── run.bat                    # Windows setup script
├── CLAUDE.md                  # AI assistant guidelines
└── README.md                  # This file
```

## 🏗️ Architecture & Development

### Clean Architecture Overview

The backend implements Clean Architecture with clear separation of concerns:

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

**Dependency Flow:** API → Application → Domain ← Infrastructure

#### Layer Responsibilities

- **🌐 API Layer**: HTTP interface, request/response handling, validation
- **⚙️ Application Layer**: Business workflows, use cases, orchestration
- **🏛️ Domain Layer**: Core business logic, entities, domain rules
- **🔧 Infrastructure Layer**: External dependencies, database, third-party APIs

### Development Workflow

1. **Domain First**: Define entities and business logic
2. **Interface Definition**: Create abstractions in application layer  
3. **Implementation**: Implement repositories in infrastructure
4. **Use Cases**: Create application services
5. **API Endpoints**: Add controllers and routes

### 🐳 Docker Commands

#### Development
```bash
# Start all services (recommended)
docker-compose up --build

# Start in background  
docker-compose up --build -d

# View logs (all services)
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db

# Stop services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v

# Restart specific service
docker-compose restart backend
```

#### Service Access
```bash
# Access backend container shell
docker-compose exec backend sh

# Access database shell
docker-compose exec db psql -U postgres -d atilio_db

# Check container status
docker-compose ps

# View resource usage
docker stats
```

#### Production
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up --build -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production
docker-compose -f docker-compose.prod.yml down
```

### 🛠️ Development Commands

#### Backend
```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Run built application
npm start
```

#### Frontend  
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Preview production build
npm run preview

# API Client Generation
npm run api:generate-from-backend  # Generate from backend
npm run api:update                 # Generate + type check
```