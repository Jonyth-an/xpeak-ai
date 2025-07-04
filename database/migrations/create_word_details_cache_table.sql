-- Create word_details_cache table for storing cached word details
-- This table will store definition, example, synonyms, and usage tip for each word
-- to avoid repeated API calls and improve performance

CREATE TABLE IF NOT EXISTS word_details_cache (
  id SERIAL PRIMARY KEY,
  word TEXT UNIQUE NOT NULL,
  definition TEXT,
  example TEXT,
  synonyms JSONB,
  usage_tip TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on word for fast lookups
CREATE INDEX IF NOT EXISTS idx_word_details_cache_word ON word_details_cache(word);

-- Add comment to table
COMMENT ON TABLE word_details_cache IS 'Cache for word details including definition, example, synonyms, and usage tip to avoid repeated API calls';

-- Add comments to columns
COMMENT ON COLUMN word_details_cache.word IS 'The word text (unique)';
COMMENT ON COLUMN word_details_cache.definition IS 'Cached definition of the word';
COMMENT ON COLUMN word_details_cache.example IS 'Cached example sentence for the word';
COMMENT ON COLUMN word_details_cache.synonyms IS 'Cached synonyms as JSON array';
COMMENT ON COLUMN word_details_cache.usage_tip IS 'Cached usage tip for the word';
COMMENT ON COLUMN word_details_cache.created_at IS 'When this cache entry was first created';
COMMENT ON COLUMN word_details_cache.updated_at IS 'When this cache entry was last updated'; 