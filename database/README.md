# Database Schema & Migrations

Production-ready PostgreSQL database with Flyway migration management, featuring UUID primary keys, proper indexing, and comprehensive development workflow.

## 🚀 Current Status

- ✅ **PostgreSQL 15** - Modern relational database with full feature support
- ✅ **Flyway 10** - Automated migration management with version control  
- ✅ **Clean Schema** - Files table with UUID primary keys and proper indexes
- ✅ **File Management** - Document storage system for .txt, .md, .json files
- ✅ **Production Ready** - Proper constraints, size limits, and validation

## 📁 Clean Structure

```
database/
├── migrations/              # Flyway SQL migration files
│   └── V1__Initial_files_schema.sql  # Files table, UUID extension, indexes
├── conf/                    # Flyway configuration
│   └── flyway.conf             # Migration settings and validation rules
└── README.md               # This documentation
```

### Current Schema (V1)
- **Files Table**: UUID primary keys, filename uniqueness, size constraints
- **UUID Extension**: uuid-ossp for UUID generation  
- **File Types**: Support for .txt, .md, .json files only
- **Size Limits**: Maximum 1MB per file with validation
- **Indexes**: Optimized for filename, content type, and date queries

## 🔄 Database Development Workflow

### Initial Setup (Already Done)
The database is production-ready with a working files schema and validation constraints.

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
touch database/migrations/V2__Add_your_feature.sql
```

#### 3. ✍️ Write Migration SQL
Add your schema changes:
```sql
-- V2__Add_file_tags.sql
-- Add tags functionality for file categorization

CREATE TABLE file_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(file_id, tag_name)
);

-- Add indexes for common queries
CREATE INDEX idx_file_tags_file_id ON file_tags(file_id);
CREATE INDEX idx_file_tags_tag_name ON file_tags(tag_name);
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
-- V3__Add_file_description.sql
ALTER TABLE files ADD COLUMN description TEXT;
CREATE INDEX idx_files_description ON files(description) WHERE description IS NOT NULL;
```

#### Creating Relationships
```sql
-- V4__Add_file_versions.sql
CREATE TABLE file_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(file_id, version_number)
);

CREATE INDEX idx_file_versions_file_id ON file_versions(file_id);
CREATE INDEX idx_file_versions_created_at ON file_versions(created_at);
```

#### Adding Constraints
```sql
-- V5__Add_filename_validation.sql
ALTER TABLE files ADD CONSTRAINT filename_format_check 
CHECK (filename ~ '^[^<>:"/\\|?*\x00-\x1f]+\.(txt|md|json)$');
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

### Files Table (V1)
```sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL UNIQUE,
    file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 1048576), -- Max 1MB
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('text/plain', 'text/markdown', 'application/json')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal query performance
CREATE INDEX idx_files_filename ON files(filename);
CREATE INDEX idx_files_created_at ON files(created_at);
CREATE INDEX idx_files_content_type ON files(content_type);
CREATE UNIQUE INDEX idx_files_file_path ON files(file_path);
```

### Database Features
- ✅ **UUID Extension** - uuid-ossp for UUID generation
- ✅ **File Type Validation** - Only .txt, .md, .json files allowed
- ✅ **Size Constraints** - Maximum 1MB per file enforced at database level
- ✅ **Proper Indexing** - Optimized for filename, content type, and date queries
- ✅ **Referential Integrity** - Ready for future table relationships
- ✅ **Timestamps** - Automatic created_at/updated_at tracking with triggers
- ✅ **Unique Constraints** - Prevents duplicate file paths

The database is **production-ready** for document management and serves as an excellent foundation for extending with additional features like file versioning, tagging, or user ownership using the established migration patterns.