-- Safe migration for general chat tables
-- This script checks for existing objects before creating them

-- 1. Create conversations table (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
        CREATE TABLE conversations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT,
            conversation_type TEXT NOT NULL CHECK (conversation_type IN ('student_tutor', 'tutor_tutor', 'support', 'general')),
            created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created conversations table';
    ELSE
        RAISE NOTICE 'conversations table already exists';
    END IF;
END $$;

-- 2. Create conversation participants table (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversation_participants') THEN
        CREATE TABLE conversation_participants (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            role TEXT NOT NULL CHECK (role IN ('student', 'tutor', 'admin')),
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(conversation_id, user_id)
        );
        RAISE NOTICE 'Created conversation_participants table';
    ELSE
        RAISE NOTICE 'conversation_participants table already exists';
    END IF;
END $$;

-- 3. Create general chat messages table (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'general_chat_messages') THEN
        CREATE TABLE general_chat_messages (
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
        RAISE NOTICE 'Created general_chat_messages table';
    ELSE
        RAISE NOTICE 'general_chat_messages table already exists';
    END IF;
END $$;

-- 4. Create indexes (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_conversations_created_by') THEN
        CREATE INDEX idx_conversations_created_by ON conversations(created_by);
        RAISE NOTICE 'Created idx_conversations_created_by index';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_conversations_conversation_type') THEN
        CREATE INDEX idx_conversations_conversation_type ON conversations(conversation_type);
        RAISE NOTICE 'Created idx_conversations_conversation_type index';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_conversations_created_at') THEN
        CREATE INDEX idx_conversations_created_at ON conversations(created_at);
        RAISE NOTICE 'Created idx_conversations_created_at index';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_conversation_participants_conversation_id') THEN
        CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
        RAISE NOTICE 'Created idx_conversation_participants_conversation_id index';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_conversation_participants_user_id') THEN
        CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
        RAISE NOTICE 'Created idx_conversation_participants_user_id index';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_conversation_participants_role') THEN
        CREATE INDEX idx_conversation_participants_role ON conversation_participants(role);
        RAISE NOTICE 'Created idx_conversation_participants_role index';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_general_chat_messages_conversation_id') THEN
        CREATE INDEX idx_general_chat_messages_conversation_id ON general_chat_messages(conversation_id);
        RAISE NOTICE 'Created idx_general_chat_messages_conversation_id index';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_general_chat_messages_sender_id') THEN
        CREATE INDEX idx_general_chat_messages_sender_id ON general_chat_messages(sender_id);
        RAISE NOTICE 'Created idx_general_chat_messages_sender_id index';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_general_chat_messages_created_at') THEN
        CREATE INDEX idx_general_chat_messages_created_at ON general_chat_messages(created_at);
        RAISE NOTICE 'Created idx_general_chat_messages_created_at index';
    END IF;
END $$;

-- 5. Enable RLS (safe to run multiple times)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_chat_messages ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies (only if they don't exist)
DO $$ 
BEGIN
    -- Conversations policies
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can view their conversations') THEN
        CREATE POLICY "Users can view their conversations" ON conversations
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM conversation_participants cp
                    WHERE cp.conversation_id = conversations.id
                    AND cp.user_id = auth.uid()
                )
            );
        RAISE NOTICE 'Created "Users can view their conversations" policy';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can create conversations') THEN
        CREATE POLICY "Users can create conversations" ON conversations
            FOR INSERT WITH CHECK (created_by = auth.uid());
        RAISE NOTICE 'Created "Users can create conversations" policy';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can update conversations they created') THEN
        CREATE POLICY "Users can update conversations they created" ON conversations
            FOR UPDATE USING (created_by = auth.uid())
            WITH CHECK (created_by = auth.uid());
        RAISE NOTICE 'Created "Users can update conversations they created" policy';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can delete conversations they created') THEN
        CREATE POLICY "Users can delete conversations they created" ON conversations
            FOR DELETE USING (created_by = auth.uid());
        RAISE NOTICE 'Created "Users can delete conversations they created" policy';
    END IF;
    
    -- Conversation participants policies
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'conversation_participants' AND policyname = 'Users can view conversation participants') THEN
        CREATE POLICY "Users can view conversation participants" ON conversation_participants
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM conversation_participants cp2
                    WHERE cp2.conversation_id = conversation_participants.conversation_id
                    AND cp2.user_id = auth.uid()
                )
            );
        RAISE NOTICE 'Created "Users can view conversation participants" policy';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'conversation_participants' AND policyname = 'Users can join conversations') THEN
        CREATE POLICY "Users can join conversations" ON conversation_participants
            FOR INSERT WITH CHECK (
                user_id = auth.uid() AND
                EXISTS (
                    SELECT 1 FROM conversations c
                    WHERE c.id = conversation_id
                    AND c.created_by = auth.uid()
                )
            );
        RAISE NOTICE 'Created "Users can join conversations" policy';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'conversation_participants' AND policyname = 'Users can leave conversations') THEN
        CREATE POLICY "Users can leave conversations" ON conversation_participants
            FOR DELETE USING (user_id = auth.uid());
        RAISE NOTICE 'Created "Users can leave conversations" policy';
    END IF;
    
    -- General chat messages policies
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'general_chat_messages' AND policyname = 'Users can view general chat messages') THEN
        CREATE POLICY "Users can view general chat messages" ON general_chat_messages
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM conversation_participants cp
                    WHERE cp.conversation_id = general_chat_messages.conversation_id
                    AND cp.user_id = auth.uid()
                )
            );
        RAISE NOTICE 'Created "Users can view general chat messages" policy';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'general_chat_messages' AND policyname = 'Users can send general chat messages') THEN
        CREATE POLICY "Users can send general chat messages" ON general_chat_messages
            FOR INSERT WITH CHECK (
                sender_id = auth.uid() AND
                EXISTS (
                    SELECT 1 FROM conversation_participants cp
                    WHERE cp.conversation_id = general_chat_messages.conversation_id
                    AND cp.user_id = auth.uid()
                )
            );
        RAISE NOTICE 'Created "Users can send general chat messages" policy';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'general_chat_messages' AND policyname = 'Users can update their own general chat messages') THEN
        CREATE POLICY "Users can update their own general chat messages" ON general_chat_messages
            FOR UPDATE USING (sender_id = auth.uid())
            WITH CHECK (sender_id = auth.uid());
        RAISE NOTICE 'Created "Users can update their own general chat messages" policy';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'general_chat_messages' AND policyname = 'Users can delete their own general chat messages') THEN
        CREATE POLICY "Users can delete their own general chat messages" ON general_chat_messages
            FOR DELETE USING (sender_id = auth.uid());
        RAISE NOTICE 'Created "Users can delete their own general chat messages" policy';
    END IF;
END $$;

-- 7. Enable real-time (safe to run multiple times)
DO $$ 
BEGIN
    -- Add to realtime publication if not already there
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'conversations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
        RAISE NOTICE 'Added conversations to realtime publication';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'conversation_participants'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
        RAISE NOTICE 'Added conversation_participants to realtime publication';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'general_chat_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE general_chat_messages;
        RAISE NOTICE 'Added general_chat_messages to realtime publication';
    END IF;
END $$;

-- 8. Create triggers (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_conversations_updated_at') THEN
        CREATE TRIGGER update_conversations_updated_at 
            BEFORE UPDATE ON conversations 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created update_conversations_updated_at trigger';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_general_chat_messages_updated_at') THEN
        CREATE TRIGGER update_general_chat_messages_updated_at 
            BEFORE UPDATE ON general_chat_messages 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created update_general_chat_messages_updated_at trigger';
    END IF;
END $$;

-- 9. Add comments (safe to run multiple times)
COMMENT ON TABLE conversations IS 'General chat conversations between users';
COMMENT ON TABLE conversation_participants IS 'Users participating in conversations';
COMMENT ON TABLE general_chat_messages IS 'Messages in general chat conversations';

-- 10. Final success message
DO $$ 
BEGIN
    RAISE NOTICE 'General chat tables migration completed successfully!';
END $$; 