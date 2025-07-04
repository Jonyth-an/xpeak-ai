-- dictionary_api_usage.sql
-- Migration to create table for tracking dictionary API usage

CREATE TABLE IF NOT EXISTS dictionary_api_usage (
    id SERIAL PRIMARY KEY,
    user_email TEXT,
    api_name TEXT NOT NULL,         -- 'oxford', 'wordnik', 'free_dictionary'
    word TEXT NOT NULL,
    status TEXT NOT NULL,           -- 'success' or 'fail'
    error_message TEXT,             -- nullable, for failures
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Indexes for faster analytics
CREATE INDEX IF NOT EXISTS idx_dictionary_api_usage_api_name ON dictionary_api_usage(api_name);
CREATE INDEX IF NOT EXISTS idx_dictionary_api_usage_status ON dictionary_api_usage(status);
CREATE INDEX IF NOT EXISTS idx_dictionary_api_usage_user_email ON dictionary_api_usage(user_email);
CREATE INDEX IF NOT EXISTS idx_dictionary_api_usage_created_at ON dictionary_api_usage(created_at);

-- Optional: Add comments for documentation
COMMENT ON TABLE dictionary_api_usage IS 'Tracks all dictionary API calls for monitoring and analytics';
COMMENT ON COLUMN dictionary_api_usage.user_email IS 'Email of the user making the API call';
COMMENT ON COLUMN dictionary_api_usage.api_name IS 'Name of the dictionary API used (oxford, wordnik, free_dictionary)';
COMMENT ON COLUMN dictionary_api_usage.word IS 'The word that was looked up';
COMMENT ON COLUMN dictionary_api_usage.status IS 'Whether the API call was successful (success) or failed (fail)';
COMMENT ON COLUMN dictionary_api_usage.error_message IS 'Error message if the API call failed';
COMMENT ON COLUMN dictionary_api_usage.created_at IS 'Timestamp when the API call was made'; 