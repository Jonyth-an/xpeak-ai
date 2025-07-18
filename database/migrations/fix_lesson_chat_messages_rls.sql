-- Fix RLS policies for lesson_chat_messages table
-- This migration fixes the issue where tutors cannot send messages

-- Drop existing policies
DROP POLICY IF EXISTS "Students can access their lesson messages" ON lesson_chat_messages;
DROP POLICY IF EXISTS "Tutors can access their lesson messages" ON lesson_chat_messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON lesson_chat_messages;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON lesson_chat_messages;

-- Create simplified, working policies
-- Allow authenticated users to insert if they are the student or tutor
CREATE POLICY "Allow authenticated users to insert" ON lesson_chat_messages
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = lesson_chat_messages.lesson_id 
      AND lessons.student_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN tutor_profiles tp ON l.tutor_id = tp.id
      WHERE l.id = lesson_chat_messages.lesson_id 
      AND tp.user_id = auth.uid()
    )
  )
);

-- Allow authenticated users to select if they are the student or tutor
CREATE POLICY "Allow authenticated users to select" ON lesson_chat_messages
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = lesson_chat_messages.lesson_id 
      AND lessons.student_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN tutor_profiles tp ON l.tutor_id = tp.id
      WHERE l.id = lesson_chat_messages.lesson_id 
      AND tp.user_id = auth.uid()
    )
  )
);

-- Allow users to update their own messages
CREATE POLICY "Allow users to update own messages" ON lesson_chat_messages
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND sender_id = auth.uid()
);

-- Allow users to delete their own messages
CREATE POLICY "Allow users to delete own messages" ON lesson_chat_messages
FOR DELETE USING (
  auth.uid() IS NOT NULL AND sender_id = auth.uid()
); 