# Word Details Cache Migration Instructions

## Option 1: Manual Migration (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Migration SQL**
   - Copy the contents of `create_word_details_cache_table.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

3. **Verify the Table**
   - Go to Table Editor
   - You should see `word_details_cache` table
   - Check that all columns are created correctly

## Option 2: Automated Migration (If RPC is available)

```bash
node run_word_details_cache_migration.js
```

## What This Migration Does

Creates a new table `word_details_cache` with the following structure:

- **id**: Auto-incrementing primary key
- **word**: The word text (unique, lowercase)
- **definition**: Cached definition from API/database
- **example**: Cached example sentence
- **synonyms**: JSON array of synonyms
- **usage_tip**: Cached usage tip from OpenAI
- **created_at**: When the cache entry was first created
- **updated_at**: When the cache entry was last updated

## Benefits

- **Performance**: Subsequent requests for the same word will be instant
- **Cost Savings**: Reduces OpenAI API calls
- **Reliability**: Cached data is always available even if external APIs are down
- **Scalability**: Shared cache across all users

## How It Works

1. When a user requests word details, the API first checks the cache
2. If found, returns cached data immediately (fast response)
3. If not found, generates details using OpenAI, stores in cache, then returns
4. Future requests for the same word will use the cached data

## Testing

After migration, test by:
1. Opening a word modal for the first time (should be slow, generates data)
2. Opening the same word modal again (should be fast, uses cache)
3. Check the database to see cached entries
