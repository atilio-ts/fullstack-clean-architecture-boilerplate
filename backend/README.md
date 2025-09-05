# Atilio Backend - Clean Architecture

Node.js backend implementation following Clean Architecture principles with TypeScript, Express.js, and PostgreSQL.

## 🚀 Tech Stack

- **Node.js 22** - JavaScript runtime
- **TypeScript** - Type-safe JavaScript superset  
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **Docker** - Containerization
- **Nodemon** - Development hot reload

## 🏗️ Clean Architecture Overview

This backend implements Clean Architecture with strict separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                 🌐 API Layer                         │
│  Controllers → Routes → Middleware → DTOs           │
├─────────────────────────────────────────────────────┤
│              ⚙️ Application Layer                   │
│  Use Cases → Services → Interfaces                  │
├─────────────────────────────────────────────────────┤
│               🏛️ Domain Layer                       │
│  Entities → Value Objects → Domain Services         │
├─────────────────────────────────────────────────────┤
│            🔧 Infrastructure Layer                  │
│  Database → Repositories → External Services        │
└─────────────────────────────────────────────────────┘
```

### Dependency Flow Rules
- **API** → **Application** → **Domain** ← **Infrastructure**
- **Domain layer** is completely independent (no external dependencies)
- **Infrastructure** implements domain interfaces
- **Application** orchestrates domain logic and infrastructure
- **API** handles HTTP concerns and delegates to application layer

## 📁 Project Structure

```
backend/src/
├── api/                    # 🌐 API Layer (HTTP interface)
│   ├── controllers/        # HTTP request handlers
│   │   ├── BaseController.ts
│   │   ├── HealthController.ts
│   │   └── index.ts
│   ├── routes/            # Route definitions
│   ├── middleware/        # Express middleware
│   └── dto/               # Data Transfer Objects
├── application/           # ⚙️ Application Layer (business workflows)
│   ├── services/          # Application services
│   ├── usecases/          # Use case implementations
│   └── interfaces/        # Repository & service interfaces
│       ├── IRepository.ts
│       └── index.ts
├── domain/                # 🏛️ Domain Layer (core business logic)
│   ├── entities/          # Business entities
│   │   ├── BaseEntity.ts
│   │   └── index.ts
│   ├── repositories/      # Repository interfaces
│   ├── valueobjects/      # Value objects
│   └── services/          # Domain services
├── infrastructure/        # 🔧 Infrastructure Layer (external concerns)
│   ├── database/          # DB connections & migrations
│   ├── repositories/      # Repository implementations
│   ├── external/          # External service integrations
│   └── config/            # Configuration files
│       ├── database.ts
│       └── index.ts
├── app.ts                 # Express app configuration
└── server.ts              # Application entry point
```

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run
```

## ⚡ Quick Start

### Local Development
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev

# Server will be available at http://localhost:3001
```

### Docker Development
```bash
# From project root
docker-compose up --build

# Backend will be available at http://localhost:3001
# Health check: http://localhost:3001/health
```

## 🎯 Clean Architecture Guidelines

### When implementing new features, follow this sequence:

#### 1. 🏛️ Domain First
Define business entities and rules:
```typescript
// domain/entities/User.ts
export class User extends BaseEntity {
  constructor(
    public readonly email: string,
    public readonly name: string
  ) {
    super();
  }
  
  // Business logic methods
  isValidEmail(): boolean {
    return /\S+@\S+\.\S+/.test(this.email);
  }
}
```

#### 2. ⚙️ Application Layer
Create use cases and interfaces:
```typescript
// application/interfaces/IUserRepository.ts
import { User } from '../../domain/entities/User';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

```typescript
// application/usecases/CreateUserUseCase.ts
export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}
  
  async execute(userData: CreateUserDto): Promise<User> {
    const user = new User(userData.email, userData.name);
    await this.userRepository.save(user);
    return user;
  }
}
```

#### 3. 🔧 Infrastructure Implementation
Implement repositories and external services:
```typescript
// infrastructure/repositories/PostgreSQLUserRepository.ts
export class PostgreSQLUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    // Database implementation
  }
  
  async save(user: User): Promise<void> {
    // Database implementation
  }
}
```

#### 4. 🌐 API Exposure
Create controllers and routes:
```typescript
// api/controllers/UserController.ts
export class UserController extends BaseController {
  constructor(private createUserUseCase: CreateUserUseCase) {
    super();
  }
  
  async createUser(req: Request, res: Response): Promise<void> {
    const user = await this.createUserUseCase.execute(req.body);
    this.sendResponse(res, user, 201);
  }
}
```

## 🎨 Code Architecture Patterns

### Base Controller
All controllers extend `BaseController` for consistent response handling:
```typescript
import { BaseController } from './BaseController';

export class UserController extends BaseController {
  // Controller methods here
}
```

### Base Entity
All domain entities extend `BaseEntity`:
```typescript
import { BaseEntity } from './BaseEntity';

export class User extends BaseEntity {
  // Entity properties and methods
}
```

### Repository Pattern
All repositories implement domain interfaces:
```typescript
// Domain interface
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
}

// Infrastructure implementation
export class PostgreSQLUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    // Implementation
  }
}
```

## 🌐 API Endpoints

### Health Check
- **GET** `/health` - Service health status

### Base Controller Response Format
```typescript
{
  success: boolean,
  data?: any,
  message?: string,
  error?: string
}
```

## 🔧 Configuration

### Environment Variables
Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Required environment variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string
- Additional config as needed

### Database Configuration
Database settings in `infrastructure/config/database.ts`:
```typescript
export const databaseConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};
```

## 🧪 Testing & Quality

### Testing Framework
- **Mocha**: Test runner with TypeScript support
- **Chai**: Assertion library with BDD/TDD assertions
- **Sinon**: Mocking and stubbing library
- **NYC**: Code coverage tool with 80% minimum threshold
- **Supertest**: HTTP integration testing
- **Dependency Cruiser**: Architectural dependency validation

### Test Structure
```
tests/
├── architecture/           # Architectural validation tests
│   ├── clean-architecture.test.ts
│   └── dependency-rules.test.ts
├── unit/                   # Unit tests for individual modules
│   ├── api/
│   │   └── controllers/
│   ├── domain/
│   │   └── entities/
│   ├── application/
│   └── infrastructure/
│       └── config/
├── integration/            # Integration tests
│   ├── api/
│   │   └── routes/
│   └── app.test.ts
└── setup.ts               # Test setup and global configuration
```

### Available Test Scripts
```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm run test:architecture    # Clean Architecture validation
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:all            # All test suites sequentially

# Generate coverage reports
npm run test:coverage

# Type checking
npm run typecheck

# Build for production
npm run build

# Development with hot reload
npm run dev
```

### Coverage Requirements
- **Minimum Coverage**: 80% across all metrics
  - Lines: 80%
  - Branches: 80%
  - Functions: 80%
  - Statements: 80%
- **Excluded Files**: `server.ts`, test files, type definitions
- **Reports**: HTML and LCOV formats generated in `coverage/`

### Architectural Testing
#### Clean Architecture Validation
- **Directory Structure**: Validates required layers and subdirectories
- **Naming Conventions**: Ensures controllers end with `Controller.ts`, entities use PascalCase, interfaces start with `I`
- **Layer Dependencies**: Prevents domain layer from importing other layers
- **Base Classes**: Validates existence of `BaseEntity` and `BaseController`
- **Index Files**: Ensures proper module exports

#### Dependency Rules
- **Domain Isolation**: Domain layer cannot depend on any other layer
- **Application Boundaries**: Application layer cannot import from API layer
- **Infrastructure Boundaries**: Infrastructure cannot import from API layer
- **No Circular Dependencies**: Enforced across all modules

### Test Configuration Files
- `.mocharc.json`: Mocha test runner configuration
- `.nycrc.json`: NYC coverage configuration with 80% thresholds
- `dependency-cruiser.config.js`: Architectural dependency rules
- `.env.test`: Test environment variables

### Code Standards
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Clean Architecture**: Strict layer separation enforced by tests
- **SOLID Principles**: Applied throughout with architectural validation
- **Test Coverage**: Minimum 80% coverage required for all modules
- **Mocking Strategy**: Sinon for stubs and mocks, isolated unit tests

## 📚 Layer-Specific Documentation

Each architectural layer has specific responsibilities:

### 🌐 API Layer (`/api`)
- HTTP request/response handling
- Route definitions
- Middleware configuration
- Data Transfer Objects (DTOs)
- Input validation

### ⚙️ Application Layer (`/application`)
- Business workflows (use cases)
- Application services
- Interface definitions
- Cross-cutting concerns

### 🏛️ Domain Layer (`/domain`)
- Business entities
- Value objects
- Domain services
- Business rules and logic
- **No external dependencies**

### 🔧 Infrastructure Layer (`/infrastructure`)
- Database access
- External API integrations
- File system operations
- Configuration management
- Implementation of domain interfaces

## 🚨 Development Best Practices

### Code Organization
1. **Domain First**: Start with business entities
2. **Interface Design**: Define abstractions before implementations
3. **Single Responsibility**: Each class has one reason to change
4. **Type Safety**: Leverage TypeScript strictly
5. **Error Handling**: Proper exception handling at each layer

### Dependency Injection
Use constructor injection for dependencies:
```typescript
export class UserController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private getUserUseCase: GetUserUseCase
  ) {}
}
```

### Error Handling
Consistent error handling across layers:
```typescript
try {
  const result = await this.useCase.execute(data);
  this.sendResponse(res, result);
} catch (error) {
  this.sendError(res, error);
}
```

## 🔍 Troubleshooting

### Common Issues

**TypeScript Compilation Errors**
```bash
npm run typecheck
```

**Development Server Not Starting**
```bash
# Check if port is in use
lsof -ti:3001 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3001   # Windows
```

**Database Connection Issues**
```bash
# Check database container
docker-compose logs db

# Reset database
docker-compose down -v db
docker-compose up -d db
```

## 📚 Additional Resources

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://www.digitalocean.com/community/conceptual_articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)