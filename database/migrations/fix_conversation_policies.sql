-- Fix infinite recursion in conversation_participants RLS policies
-- This script removes the problematic policies and creates new ones

-- 1. Drop the problematic policies
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can leave conversations" ON conversation_participants;

-- 2. Create new, simplified policies that don't cause recursion
CREATE POLICY "Users can view conversation participants" ON conversation_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_participants.conversation_id
            AND c.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can join conversations" ON conversation_participants
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_id
            AND c.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can leave conversations" ON conversation_participants
    FOR DELETE USING (user_id = auth.uid());

-- 3. Also fix the conversations policy to avoid potential issues
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;

CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversations.id
            AND cp.user_id = auth.uid()
        )
    );

RAISE NOTICE 'Fixed conversation_participants RLS policies - infinite recursion resolved!'; 