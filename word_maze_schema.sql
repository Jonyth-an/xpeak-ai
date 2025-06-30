-- Word Maze Database Schema
-- This schema supports the complete Word Maze vocabulary learning system

-- ========================================
-- CORE VOCABULARY TABLES
-- ========================================

-- Master word entries table
CREATE TABLE word_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word_text VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL DEFAULT 'word', -- 'word', 'idiom', 'phrase', 'slang'
    difficulty_level VARCHAR(10), -- 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
    difficulty_score DECIMAL(3,2), -- 1.0-10.0 scale
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_source VARCHAR(100), -- 'oxford', 'wordnik', 'manual', etc.
    metadata JSONB DEFAULT '{}'::jsonb -- Flexible storage for additional data
);

-- Definitions from different sources
CREATE TABLE word_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word_id UUID NOT NULL REFERENCES word_entries(id) ON DELETE CASCADE,
    source_api VARCHAR(50) NOT NULL, -- 'oxford', 'wordnik', 'urban', 'ai'
    definition_text TEXT NOT NULL,
    part_of_speech VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    confidence_score DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(word_id, source_api, definition_text)
);

-- Example sentences for words
CREATE TABLE word_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word_id UUID NOT NULL REFERENCES word_entries(id) ON DELETE CASCADE,
    source_api VARCHAR(50) NOT NULL,
    example_text TEXT NOT NULL,
    context VARCHAR(100), -- 'formal', 'casual', 'business', etc.
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Word tags for categorization
CREATE TABLE word_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word_id UUID NOT NULL REFERENCES word_entries(id) ON DELETE CASCADE,
    tag_type VARCHAR(50) NOT NULL, -- 'topic', 'tone', 'usage', 'emotion', 'game'
    tag_value VARCHAR(100) NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 1.0,
    source VARCHAR(50) DEFAULT 'ai', -- 'oxford', 'wordnik', 'ai', 'manual'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(word_id, tag_type, tag_value)
);

-- Word relationships (synonyms, antonyms, etc.)
CREATE TABLE word_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_word_id UUID NOT NULL REFERENCES word_entries(id) ON DELETE CASCADE,
    to_word_id UUID NOT NULL REFERENCES word_entries(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'synonym', 'antonym', 'hypernym', 'hyponym', 'related'
    strength_score DECIMAL(3,2) DEFAULT 1.0, -- How strong the relationship is
    source VARCHAR(50) DEFAULT 'wordnet', -- 'wordnet', 'wordnik', 'ai'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_word_id, to_word_id, relationship_type)
);

-- ========================================
-- USER PROGRESS TABLES
-- ========================================

-- User mastery tracking
CREATE TABLE user_word_mastery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References your existing users table
    word_id UUID NOT NULL REFERENCES word_entries(id) ON DELETE CASCADE,
    mastery_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0-1.0 scale
    attempts_count INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    last_attempted_at TIMESTAMP WITH TIME ZONE,
    first_encountered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, word_id)
);

-- User learning sessions
CREATE TABLE user_learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_type VARCHAR(50) NOT NULL, -- 'maze', 'challenge', 'review'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    words_encountered INTEGER DEFAULT 0,
    words_mastered INTEGER DEFAULT 0,
    session_data JSONB DEFAULT '{}'::jsonb -- Store session-specific data
);

-- ========================================
-- MAZE ENGINE TABLES
-- ========================================

-- Maze paths/trails
CREATE TABLE maze_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    path_type VARCHAR(50) NOT NULL, -- 'thematic', 'difficulty', 'relationship', 'custom'
    difficulty_level VARCHAR(10),
    estimated_duration INTEGER, -- in minutes
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Maze nodes (words in a path)
CREATE TABLE maze_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_id UUID NOT NULL REFERENCES maze_paths(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES word_entries(id) ON DELETE CASCADE,
    position INTEGER NOT NULL, -- Order in the path
    challenge_type VARCHAR(50) DEFAULT 'definition', -- 'definition', 'example', 'synonym', 'story'
    unlock_condition JSONB DEFAULT '{}'::jsonb, -- Conditions to unlock this node
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(path_id, position)
);

-- User maze progress
CREATE TABLE user_maze_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    path_id UUID NOT NULL REFERENCES maze_paths(id) ON DELETE CASCADE,
    current_node_position INTEGER DEFAULT 0,
    completed_nodes INTEGER DEFAULT 0,
    total_nodes INTEGER NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    progress_data JSONB DEFAULT '{}'::jsonb,
    UNIQUE(user_id, path_id)
);

-- ========================================
-- CHALLENGE SYSTEM TABLES
-- ========================================

-- Challenge templates
CREATE TABLE challenge_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    challenge_type VARCHAR(50) NOT NULL, -- 'definition', 'example', 'synonym', 'story', 'emoji'
    template_data JSONB NOT NULL, -- Template structure for generating challenges
    difficulty_level VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User challenge attempts
CREATE TABLE user_challenge_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    word_id UUID NOT NULL REFERENCES word_entries(id) ON DELETE CASCADE,
    challenge_type VARCHAR(50) NOT NULL,
    challenge_data JSONB NOT NULL, -- The actual challenge presented
    user_answer TEXT,
    is_correct BOOLEAN,
    time_taken INTEGER, -- in seconds
    attempt_number INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CACHE & PERFORMANCE TABLES
-- ========================================

-- API response cache
CREATE TABLE api_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(500) NOT NULL UNIQUE,
    api_source VARCHAR(50) NOT NULL,
    response_data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Word entries indexes
CREATE INDEX idx_word_entries_text ON word_entries(word_text);
CREATE INDEX idx_word_entries_type ON word_entries(type);
CREATE INDEX idx_word_entries_difficulty ON word_entries(difficulty_level);

-- User mastery indexes
CREATE INDEX idx_user_word_mastery_user ON user_word_mastery(user_id);
CREATE INDEX idx_user_word_mastery_word ON user_word_mastery(word_id);
CREATE INDEX idx_user_word_mastery_score ON user_word_mastery(mastery_score);

-- Maze indexes
CREATE INDEX idx_maze_nodes_path ON maze_nodes(path_id);
CREATE INDEX idx_maze_nodes_position ON maze_nodes(position);
CREATE INDEX idx_user_maze_progress_user ON user_maze_progress(user_id);

-- Cache indexes
CREATE INDEX idx_api_cache_key ON api_cache(cache_key);
CREATE INDEX idx_api_cache_expires ON api_cache(expires_at);

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_word_entries_updated_at BEFORE UPDATE ON word_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_word_mastery_updated_at BEFORE UPDATE ON user_word_mastery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 