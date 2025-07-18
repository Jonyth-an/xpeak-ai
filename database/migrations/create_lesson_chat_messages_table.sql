-- Create lesson chat messages table with real-time support
CREATE TABLE IF NOT EXISTS lesson_chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('student', 'tutor')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lesson_chat_messages_lesson_id ON lesson_chat_messages(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_chat_messages_created_at ON lesson_chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_lesson_chat_messages_sender_id ON lesson_chat_messages(sender_id);

-- Enable Row Level Security (RLS)
ALTER TABLE lesson_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see messages from lessons they're participating in
CREATE POLICY "Users can view chat messages from their lessons" ON lesson_chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lessons l
            WHERE l.id = lesson_chat_messages.lesson_id
            AND (
                l.student_id = auth.uid() OR 
                l.tutor_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM lesson_participants lp
                    WHERE lp.lesson_id = l.id AND lp.user_id = auth.uid()
                )
            )
        )
    );

-- Users can only insert messages for lessons they're participating in
CREATE POLICY "Users can insert chat messages in their lessons" ON lesson_chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM lessons l
            WHERE l.id = lesson_chat_messages.lesson_id
            AND (
                l.student_id = auth.uid() OR 
                l.tutor_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM lesson_participants lp
                    WHERE lp.lesson_id = l.id AND lp.user_id = auth.uid()
                )
            )
        )
        AND sender_id = auth.uid()
    );

-- Users can only update their own messages
CREATE POLICY "Users can update their own chat messages" ON lesson_chat_messages
    FOR UPDATE USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- Users can only delete their own messages
CREATE POLICY "Users can delete their own chat messages" ON lesson_chat_messages
    FOR DELETE USING (sender_id = auth.uid());

-- Enable real-time for this table
ALTER PUBLICATION supabase_realtime ADD TABLE lesson_chat_messages;

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_lesson_chat_messages_updated_at 
    BEFORE UPDATE ON lesson_chat_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE lesson_chat_messages IS 'Real-time chat messages for lessons';
COMMENT ON COLUMN lesson_chat_messages.lesson_id IS 'Reference to the lesson this message belongs to';
COMMENT ON COLUMN lesson_chat_messages.sender_id IS 'User ID of the message sender';
COMMENT ON COLUMN lesson_chat_messages.sender_type IS 'Type of sender: student or tutor';
COMMENT ON COLUMN lesson_chat_messages.message IS 'The chat message content'; 