# Tests Directory

This directory contains all test files, migration scripts, and utility scripts for the Xpeak AI application.

## Directory Structure

```
/tests/
├── api/           # API and service tests
├── integration/   # Integration and end-to-end tests
├── migration/     # Database migration scripts
├── setup/         # Setup and configuration tests
├── utils/         # Utility and cleanup scripts
└── README.md      # This file
```

## API Tests (`/api/`)

Tests for individual APIs and services:

- **test-basic-api.js** - Basic API connectivity tests
- **test-oxford.js** - Oxford Dictionary API integration tests
- **test-wordnik.js** - Wordnik API integration tests
- **test-simple-word.js** - Simple word processing tests
- **test-word-addition.js** - Word addition functionality tests
- **test-word-cache.js** - Word caching system tests
- **test-maze-paths.js** - Word maze path generation tests

### Usage
```bash
node tests/api/test-basic-api.js
node tests/api/test-oxford.js
```

## Integration Tests (`/integration/`)

End-to-end and integration tests:

- **test-oauth-flow.js** - OAuth authentication flow tests
- **test-oauth-callback.js** - OAuth callback handling tests
- **test-session-persistence.js** - Session management tests
- **test-session-after-oauth.js** - Post-OAuth session tests
- **test-email-verification.js** - Email verification flow tests
- **test-profile-functionality.js** - User profile functionality tests
- **test-billing-functionality.js** - Billing system integration tests
- **test-invoice-history.js** - Invoice history functionality tests
- **test-plan-change-flow.js** - Subscription plan change tests

### Usage
```bash
node tests/integration/test-oauth-flow.js
node tests/integration/test-billing-functionality.js
```

## Migration Scripts (`/migration/`)

Database migration and setup scripts:

- **run_user_collections_migration.js** - User word collections migration
- **run_word_details_cache_migration.js** - Word details cache migration
- **run_pause_migrations.js** - Subscription pause functionality migration
- **check_migration_status.js** - Migration status checking utility

### Usage
```bash
node tests/migration/run_user_collections_migration.js
node tests/migration/check_migration_status.js
```

## Setup Tests (`/setup/`)

Configuration and setup verification tests:

- **test-server-side-setup.js** - Server-side configuration tests
- **test-storage-setup.js** - Storage system setup tests
- **test-avatar-features.js** - Avatar upload functionality tests
- **test-rate-limiting.js** - Rate limiting configuration tests
- **test-product-extraction.js** - Product data extraction tests

### Usage
```bash
node tests/setup/test-server-side-setup.js
node tests/setup/test-storage-setup.js
```

## Utility Scripts (`/utils/`)

Utility and cleanup scripts:

- **cleanup-duplicates.js** - Remove duplicate database entries

### Usage
```bash
node tests/utils/cleanup-duplicates.js
```

## Running Tests

### Individual Tests
```bash
# API Tests
node tests/api/test-basic-api.js

# Integration Tests
node tests/integration/test-oauth-flow.js

# Setup Tests
node tests/setup/test-server-side-setup.js
```

### All Tests (if you want to run them all)
```bash
# Run all API tests
for file in tests/api/*.js; do
  echo "Running $file..."
  node "$file"
done

# Run all integration tests
for file in tests/integration/*.js; do
  echo "Running $file..."
  node "$file"
done
```

## Environment Requirements

Most tests require:
- `.env.local` file with proper configuration
- Database connection (Supabase)
- Stripe API keys (for billing tests)
- OAuth credentials (for auth tests)

## Best Practices

1. **Run tests individually** - Most tests are designed to be run independently
2. **Check environment** - Ensure all required environment variables are set
3. **Database state** - Some tests may modify database state, run in development only
4. **API limits** - Be mindful of API rate limits when running external API tests
5. **Cleanup** - Some tests may create test data that needs cleanup

## Adding New Tests

When adding new test files:

1. **Categorize appropriately** - Place in the correct subdirectory
2. **Update this README** - Add the new test to the appropriate section
3. **Include usage instructions** - Document how to run the test
4. **Environment requirements** - Document any special requirements

## Notes

- These are **manual test scripts**, not automated unit tests
- They're useful for **development and debugging**
- Some tests may **modify production data** - use with caution
- Consider **automating** these tests in the future with a proper testing framework 