-- Simple fix: Temporarily disable RLS on conversation_participants to test
-- This will help us identify if RLS is the root cause

-- 1. Disable RLS on conversation_participants
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;

-- 2. Drop all policies on conversation_participants
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can leave conversations" ON conversation_participants;

-- 3. Create a simple policy that allows all operations for now
CREATE POLICY "Allow all operations" ON conversation_participants
    FOR ALL USING (true)
    WITH CHECK (true);

-- 4. Also simplify conversations table policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Allow all operations" ON conversations
    FOR ALL USING (true)
    WITH CHECK (true);

RAISE NOTICE 'Temporarily disabled RLS on conversation tables for testing!'; 