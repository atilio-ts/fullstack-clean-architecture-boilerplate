# Database Migrations

This folder contains the database schema and migrations managed by Flyway.

## Structure

```
database/
├── migrations/          # Flyway SQL migration files
│   ├── V1__Initial_schema.sql
│   └── V2__Add_sample_data.sql
├── conf/               # Flyway configuration
│   └── flyway.conf
├── init.sql           # Legacy initialization (deprecated, use migrations instead)
└── README.md          # This file
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

## Troubleshooting

### Migration Failed
1. Check Flyway logs in Docker container
2. Fix the migration file
3. If needed, manually fix database state
4. Use `flyway repair` to mark failed migration as resolved

### Reset Development Database
```bash
# Stop containers and remove volumes
docker-compose down -v

# Restart (will run all migrations from scratch)
docker-compose up --build
```