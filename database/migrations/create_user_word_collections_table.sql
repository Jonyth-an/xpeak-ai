-- Create user word collections table
-- This table tracks which words each user has added to their personal word bank
-- Users can delete words from their collection without affecting the shared word bank

CREATE TABLE user_word_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References your existing users table
    word_id UUID NOT NULL REFERENCES word_entries(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_via VARCHAR(50) DEFAULT 'manual', -- 'manual', 'bulk_import', 'ai_suggestion', etc.
    notes TEXT, -- User's personal notes about this word
    is_active BOOLEAN DEFAULT TRUE, -- Soft delete flag
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, word_id)
);

-- Indexes for performance
CREATE INDEX idx_user_word_collections_user ON user_word_collections(user_id);
CREATE INDEX idx_user_word_collections_word ON user_word_collections(word_id);
CREATE INDEX idx_user_word_collections_active ON user_word_collections(is_active);
CREATE INDEX idx_user_word_collections_added_at ON user_word_collections(added_at);

-- Trigger to update updated_at column
CREATE TRIGGER update_user_word_collections_updated_at 
    BEFORE UPDATE ON user_word_collections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 