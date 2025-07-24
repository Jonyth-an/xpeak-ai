-- Add unread count and last read timestamp fields to conversations table
-- This migration adds support for tracking unread messages in conversations

-- Add unread_count and last_read_at columns to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS unread_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add index for faster unread count queries
CREATE INDEX IF NOT EXISTS idx_conversations_unread_count ON conversations(unread_count);
CREATE INDEX IF NOT EXISTS idx_conversations_last_read_at ON conversations(last_read_at);

-- Add comment for documentation
COMMENT ON COLUMN conversations.unread_count IS 'Number of unread messages in this conversation';
COMMENT ON COLUMN conversations.last_read_at IS 'Timestamp when conversation was last read';

-- Create a function to update unread count when new messages are added
CREATE OR REPLACE FUNCTION update_conversation_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment unread count for all participants except the sender
    UPDATE conversations 
    SET unread_count = unread_count + 1,
        updated_at = NOW()
    WHERE id = NEW.conversation_id
    AND EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = NEW.conversation_id
        AND cp.user_id != NEW.sender_id
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update unread count when new messages are inserted
DROP TRIGGER IF EXISTS trigger_update_conversation_unread_count ON general_chat_messages;
CREATE TRIGGER trigger_update_conversation_unread_count
    AFTER INSERT ON general_chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_unread_count();

-- Create a function to mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_as_read(conversation_uuid UUID, user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Reset unread count and update last_read_at for the specific user
    UPDATE conversations 
    SET unread_count = 0,
        last_read_at = NOW(),
        updated_at = NOW()
    WHERE id = conversation_uuid
    AND EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = conversation_uuid
        AND cp.user_id = user_uuid
    );
END;
$$ language 'plpgsql'; 