# Database Schema & Migrations

Production-ready PostgreSQL database with Flyway migration management, featuring UUID primary keys, proper indexing, and comprehensive development workflow.

## 🚀 Current Status

- ✅ **PostgreSQL 15** - Modern relational database with full feature support
- ✅ **Flyway 10** - Automated migration management with version control  
- ✅ **Clean Schema** - Users table with UUID primary keys and proper indexes
- ✅ **Development Data** - Sample users for development and testing
- ✅ **Production Ready** - Proper constraints, indexes, and validation

## 📁 Clean Structure

```
database/
├── migrations/              # Flyway SQL migration files
│   ├── V1__Initial_schema.sql    # Users table, UUID extension, indexes
│   └── V2__Add_sample_data.sql   # Sample users for development
├── conf/                    # Flyway configuration
│   └── flyway.conf             # Migration settings and validation rules
└── README.md               # This documentation
```

### Current Schema (V2)
- **Users Table**: UUID primary keys, email uniqueness, timestamps
- **UUID Extension**: uuid-ossp for UUID generation
- **Indexes**: Optimized for email lookups and date queries
- **Sample Data**: 3 development users with example password hashes

## 🔄 Database Development Workflow

### Initial Setup (Already Done)
The database is production-ready with a working users schema and sample data.

### Adding New Tables/Features

#### 1. 📝 Plan Your Schema
Before creating migrations, plan your database changes:
```sql
-- Example: Planning a posts table
-- Consider: relationships, indexes, constraints
-- Think about: data types, nullable fields, defaults
```

#### 2. 🆕 Create New Migration
Create a new migration file with proper versioning:
```bash
# Create the next migration file
touch database/migrations/V3__Add_posts_table.sql
```

#### 3. ✍️ Write Migration SQL
Add your schema changes:
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
CREATE INDEX idx_posts_created_at ON posts(created_at);
```

#### 4. 🧪 Test Migration Locally
Test your migration with Docker:
```bash
# Reset and test from scratch
docker-compose down -v
docker-compose up --build

# Check migration status
npm run db:info  # (run from backend directory)
```

#### 5. 🔍 Validate Schema
Verify your changes worked correctly:
```bash
# Connect to database and check schema
docker exec -it atilio-db psql -U postgres -d atilio_db -c "\dt"
docker exec -it atilio-db psql -U postgres -d atilio_db -c "\d posts"
```

#### 6. 📋 Update Backend Integration
Update backend entities and repositories to match your new schema.

### Migration Best Practices

1. **Never Modify Existing Migrations** - Once applied to any environment
2. **Use Descriptive Names** - Make the purpose clear from filename  
3. **Test Locally First** - Always verify migrations work before deployment
4. **Include Rollback Plan** - Consider how to undo changes if needed
5. **Add Indexes Thoughtfully** - Index frequently queried columns
6. **Use Transactions** - Wrap related changes in BEGIN/COMMIT blocks

### Common Migration Patterns

#### Adding a Column
```sql
-- V4__Add_user_avatar_url.sql
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255);
CREATE INDEX idx_users_avatar_url ON users(avatar_url) WHERE avatar_url IS NOT NULL;
```

#### Creating Relationships
```sql
-- V5__Add_user_roles.sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_name VARCHAR(50) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_name)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_name ON user_roles(role_name);
```

#### Adding Constraints
```sql
-- V6__Add_email_validation.sql
ALTER TABLE users ADD CONSTRAINT email_format_check 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
```

## 🛠️ Migration Commands

### Automatic Migrations (Recommended)
Migrations run automatically with Docker Compose:
```bash
# From project root
docker-compose up --build
```

### Manual Migration Commands
For advanced management (run from backend directory):
```bash
# Check migration status
npm run db:info

# Run pending migrations
npm run db:migrate  

# Validate migration files
npm run db:validate
```

## Migration Naming Convention

Flyway migrations follow a specific naming pattern:

- **Versioned migrations**: `V{version}__{description}.sql`
  - Example: `V1__Initial_schema.sql`
  - Example: `V2_1__Add_user_roles.sql`

- **Repeatable migrations**: `R__{description}.sql`
  - Example: `R__Create_views.sql`

## Migration Rules

1. **Never modify existing migration files** - once applied to any environment
2. **Always increment version numbers** - use semantic versioning (V1, V2, V2_1, etc.)
3. **Use descriptive names** - make it clear what the migration does
4. **Test migrations** - always test on development environment first
5. **Keep migrations atomic** - each migration should be a complete, reversible unit

## Development Workflow

### Adding New Migrations

1. Create a new migration file in `database/migrations/`
2. Follow the naming convention: `V{next_version}__{description}.sql`
3. Write SQL statements for the migration
4. Test locally with `docker-compose up --build`

### Example Migration Files

#### V3__Add_posts_table.sql
```sql
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

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_published ON posts(published);
```

## Commands

### Run Migrations
Migrations run automatically when starting the application with Docker Compose:
```bash
docker-compose up --build
```

### Manual Flyway Commands
```bash
# Run migrations manually
docker run --rm -v $(pwd)/database/migrations:/flyway/sql \
  flyway/flyway:10-alpine \
  -url=jdbc:postgresql://localhost:5432/atilio_db \
  -user=postgres -password=postgres migrate

# Check migration status
docker run --rm -v $(pwd)/database/migrations:/flyway/sql \
  flyway/flyway:10-alpine \
  -url=jdbc:postgresql://localhost:5432/atilio_db \
  -user=postgres -password=postgres info

# Validate migrations
docker run --rm -v $(pwd)/database/migrations:/flyway/sql \
  flyway/flyway:10-alpine \
  -url=jdbc:postgresql://localhost:5432/atilio_db \
  -user=postgres -password=postgres validate
```

## Production Considerations

1. **Backup before migrations** - always backup production database
2. **Test migrations** - run on staging environment first
3. **Monitor migration time** - large migrations may cause downtime
4. **Use transactions** - wrap migrations in transactions when possible
5. **Plan rollback strategy** - have a plan to rollback if needed

## 🔍 Troubleshooting

### Migration Failures
```bash
# Check Flyway container logs
docker-compose logs flyway

# View current migration status
npm run db:info  # (from backend directory)

# If migration failed partway through
# 1. Fix the migration file
# 2. Manually clean up database if needed
# 3. Use repair command if necessary
docker run --rm -v $(pwd)/migrations:/flyway/sql \
  flyway/flyway:10-alpine -url=jdbc:postgresql://localhost:5432/atilio_db \
  -user=postgres -password=postgres repair
```

### Database Connection Issues
```bash
# Check if database container is running
docker-compose ps

# View database logs
docker-compose logs db

# Connect to database manually
docker exec -it atilio-db psql -U postgres -d atilio_db
```

### Migration Validation Errors
```bash
# Check migration file syntax
npm run db:validate  # (from backend directory)

# Common issues:
# - Missing semicolons at end of statements
# - Invalid SQL syntax
# - Referencing non-existent tables/columns
```

### Reset Development Database
```bash
# Complete reset (removes all data)
docker-compose down -v
docker-compose up --build

# This will:
# 1. Remove all containers and volumes
# 2. Recreate database from scratch
# 3. Run all migrations in order
```

### Schema Inspection Commands
```bash
# List all tables
docker exec -it atilio-db psql -U postgres -d atilio_db -c "\dt"

# Describe table structure
docker exec -it atilio-db psql -U postgres -d atilio_db -c "\d users"

# View migration history
docker exec -it atilio-db psql -U postgres -d atilio_db \
  -c "SELECT * FROM flyway_schema_history ORDER BY version;"
```

## 📊 Production Deployment

### Pre-Deployment Checklist
1. ✅ **Test migrations** on staging environment
2. ✅ **Backup production database** before migration
3. ✅ **Review migration files** for destructive operations
4. ✅ **Plan rollback strategy** in case of issues
5. ✅ **Monitor migration performance** for large datasets

### Production Migration Commands
```bash
# Backup before migration (adjust connection details)
pg_dump -h localhost -p 5432 -U postgres atilio_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations on production
docker run --rm -v $(pwd)/migrations:/flyway/sql \
  flyway/flyway:10-alpine \
  -url=jdbc:postgresql://production-host:5432/atilio_db \
  -user=production_user -password=$PROD_PASSWORD \
  migrate
```

## 🎯 Current Database Schema

### Users Table (V1)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### Sample Data (V2)
- **3 development users** with example bcrypt password hashes
- **Test data** for local development and frontend integration
- **Proper UUID primary keys** for all user records

### Database Features
- ✅ **UUID Extension** - uuid-ossp for UUID generation
- ✅ **Proper Indexing** - Optimized for common query patterns
- ✅ **Referential Integrity** - Foreign key constraints ready
- ✅ **Timestamps** - Automatic created_at/updated_at tracking
- ✅ **Sample Data** - Ready for immediate development use

The database is **production-ready** and serves as an excellent foundation for extending with additional tables and features using the established migration patterns.