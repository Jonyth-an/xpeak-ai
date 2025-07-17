-- Create lesson_participants table to track UIDs and prevent conflicts
CREATE TABLE IF NOT EXISTS lesson_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    uid INTEGER NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lesson_id, uid),
    UNIQUE(lesson_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lesson_participants_lesson_id ON lesson_participants(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_participants_uid ON lesson_participants(uid);
CREATE INDEX IF NOT EXISTS idx_lesson_participants_user_id ON lesson_participants(user_id);

-- Add RLS policies
ALTER TABLE lesson_participants ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see their own participation
CREATE POLICY "Users can view their own lesson participation" ON lesson_participants
    FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert their own participation
CREATE POLICY "Users can insert their own lesson participation" ON lesson_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own participation
CREATE POLICY "Users can update their own lesson participation" ON lesson_participants
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to delete their own participation
CREATE POLICY "Users can delete their own lesson participation" ON lesson_participants
    FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_lesson_participants_updated_at 
    BEFORE UPDATE ON lesson_participants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 