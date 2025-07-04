# Database Migrations

This directory contains all database migration files for the Xpeak AI application.

## Structure

```
/database/
├── README.md              # This file
└── migrations/            # SQL migration files
```

## Migration Files

### User Management
- **add_language_preferences_columns.sql** - Add language preference columns to user profiles
- **add_unique_constraint.sql** - Add unique constraints to prevent duplicates
- **create_user_subscriptions_table.sql** - Create user subscriptions table
- **create_user_word_collections_table.sql** - Create user word collections table

### Word Management
- **create_word_details_cache_table.sql** - Create word details cache table
- **word_maze_schema.sql** - Complete Word Maze database schema

### Billing & Subscriptions
- **billing_improvements_migration.sql** - Billing system improvements
- **cleanup-duplicate-subscriptions.sql** - Remove duplicate subscription entries

### Data Management
- **dictionary_api_usage.sql** - Track dictionary API usage
- **migration_add_language_preferences.sql** - Language preferences migration

## Running Migrations

### Manual Execution
```bash
# Run a specific migration
psql -d your_database -f database/migrations/migration_name.sql

# Run all migrations (in order)
for file in database/migrations/*.sql; do
  echo "Running $file..."
  psql -d your_database -f "$file"
done
```

### Using Supabase
```bash
# Apply migrations to Supabase
supabase db push

# Or run individual files
supabase db reset
```

## Migration Best Practices

1. **Version Control** - All migrations are tracked in git
2. **Ordering** - Run migrations in chronological order
3. **Backup** - Always backup before running migrations
4. **Testing** - Test migrations in development first
5. **Rollback** - Keep rollback scripts when possible

## Migration Status

To check migration status, use the migration status script:
```bash
node tests/migration/check_migration_status.js
```

## Adding New Migrations

1. **Create new SQL file** in `/database/migrations/`
2. **Use descriptive naming** - `YYYY-MM-DD_description.sql`
3. **Include comments** - Document what the migration does
4. **Test thoroughly** - Test in development environment
5. **Update this README** - Add the new migration to the list

## Rollback Procedures

For critical migrations, consider creating rollback scripts:
```sql
-- Example rollback for add_language_preferences_columns.sql
ALTER TABLE users DROP COLUMN IF EXISTS language_preferences;
```

## Database Schema

The main database schema includes:
- **Users** - User accounts and profiles
- **Subscriptions** - User subscription data
- **Word Collections** - User word collections
- **Word Details Cache** - Cached word information
- **API Usage** - Dictionary API usage tracking

For detailed schema information, see the individual migration files.

---

*Last updated: July 2025* 