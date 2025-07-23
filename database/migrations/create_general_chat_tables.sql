-- Create general chat tables with real-time support
-- This migration creates the infrastructure for general chat functionality outside of lessons

-- 1. Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    conversation_type TEXT NOT NULL CHECK (conversation_type IN ('student_tutor', 'tutor_tutor', 'support', 'general')),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create conversation participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'tutor', 'admin')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- 3. Create general chat messages table
CREATE TABLE IF NOT EXISTS general_chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_conversation_type ON conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_role ON conversation_participants(role);

CREATE INDEX IF NOT EXISTS idx_general_chat_messages_conversation_id ON general_chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_general_chat_messages_sender_id ON general_chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_general_chat_messages_created_at ON general_chat_messages(created_at);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_chat_messages ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for conversations
-- Users can view conversations they're participating in
CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversations.id
            AND cp.user_id = auth.uid()
        )
    );

-- Users can create conversations
CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- Users can update conversations they created
CREATE POLICY "Users can update conversations they created" ON conversations
    FOR UPDATE USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Users can delete conversations they created
CREATE POLICY "Users can delete conversations they created" ON conversations
    FOR DELETE USING (created_by = auth.uid());

-- 7. Create RLS policies for conversation_participants
-- Users can view participants of conversations they're in
CREATE POLICY "Users can view conversation participants" ON conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp2
            WHERE cp2.conversation_id = conversation_participants.conversation_id
            AND cp2.user_id = auth.uid()
        )
    );

-- Users can join conversations (with some restrictions)
CREATE POLICY "Users can join conversations" ON conversation_participants
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_id
            AND c.created_by = auth.uid()
        )
    );

-- Users can leave conversations
CREATE POLICY "Users can leave conversations" ON conversation_participants
    FOR DELETE USING (user_id = auth.uid());

-- 8. Create RLS policies for general_chat_messages
-- Users can view messages from conversations they're participating in
CREATE POLICY "Users can view general chat messages" ON general_chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = general_chat_messages.conversation_id
            AND cp.user_id = auth.uid()
        )
    );

-- Users can send messages to conversations they're participating in
CREATE POLICY "Users can send general chat messages" ON general_chat_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = general_chat_messages.conversation_id
            AND cp.user_id = auth.uid()
        )
    );

-- Users can update their own messages
CREATE POLICY "Users can update their own general chat messages" ON general_chat_messages
    FOR UPDATE USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "Users can delete their own general chat messages" ON general_chat_messages
    FOR DELETE USING (sender_id = auth.uid());

-- 9. Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE general_chat_messages;

-- 10. Create triggers for updated_at
CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_general_chat_messages_updated_at 
    BEFORE UPDATE ON general_chat_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 11. Add comments for documentation
COMMENT ON TABLE conversations IS 'General chat conversations between users';
COMMENT ON TABLE conversation_participants IS 'Users participating in conversations';
COMMENT ON TABLE general_chat_messages IS 'Messages in general chat conversations'; 