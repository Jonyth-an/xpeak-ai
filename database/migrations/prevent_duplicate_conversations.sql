-- Prevent duplicate conversations between student-tutor pairs
-- This migration adds constraints to ensure only one conversation exists per student-tutor pair

-- First, let's create a function to generate a unique key for student-tutor pairs
CREATE OR REPLACE FUNCTION get_student_tutor_pair_key(conversation_id UUID)
RETURNS TEXT AS $$
DECLARE
    student_id UUID;
    tutor_id UUID;
BEGIN
    -- Get student and tutor IDs for this conversation
    SELECT 
        cp1.user_id,
        cp2.user_id
    INTO 
        student_id,
        tutor_id
    FROM conversation_participants cp1
    JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.conversation_id = conversation_id
    AND cp1.role = 'student'
    AND cp2.role = 'tutor';
    
    -- Return sorted pair key (smaller ID first for consistency)
    IF student_id < tutor_id THEN
        RETURN student_id::TEXT || '-' || tutor_id::TEXT;
    ELSE
        RETURN tutor_id::TEXT || '-' || student_id::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add a computed column for the pair key
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS student_tutor_pair_key TEXT GENERATED ALWAYS AS (
    CASE 
        WHEN conversation_type = 'student_tutor' THEN get_student_tutor_pair_key(id)
        ELSE NULL
    END
) STORED;

-- Create a unique index on the pair key to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_unique_student_tutor_pair 
ON conversations(student_tutor_pair_key) 
WHERE conversation_type = 'student_tutor' AND student_tutor_pair_key IS NOT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN conversations.student_tutor_pair_key IS 'Unique key for student-tutor pairs to prevent duplicate conversations';

-- Create a trigger function to validate conversation participants
CREATE OR REPLACE FUNCTION validate_student_tutor_conversation()
RETURNS TRIGGER AS $$
DECLARE
    student_count INTEGER;
    tutor_count INTEGER;
BEGIN
    -- Only validate for student_tutor conversations
    IF NEW.conversation_type = 'student_tutor' THEN
        -- Count participants by role
        SELECT 
            COUNT(*) FILTER (WHERE role = 'student'),
            COUNT(*) FILTER (WHERE role = 'tutor')
        INTO 
            student_count,
            tutor_count
        FROM conversation_participants
        WHERE conversation_id = NEW.id;
        
        -- Ensure exactly one student and one tutor
        IF student_count != 1 OR tutor_count != 1 THEN
            RAISE EXCEPTION 'Student-tutor conversations must have exactly one student and one tutor participant';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate on insert/update
DROP TRIGGER IF EXISTS trigger_validate_student_tutor_conversation ON conversations;
CREATE TRIGGER trigger_validate_student_tutor_conversation
    AFTER INSERT OR UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION validate_student_tutor_conversation();

-- Create a function to find or create conversation safely
CREATE OR REPLACE FUNCTION find_or_create_student_tutor_conversation(
    p_student_id UUID,
    p_tutor_id UUID,
    p_title TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    existing_conversation_id UUID;
    new_conversation_id UUID;
    pair_key TEXT;
BEGIN
    -- Generate pair key
    IF p_student_id < p_tutor_id THEN
        pair_key := p_student_id::TEXT || '-' || p_tutor_id::TEXT;
    ELSE
        pair_key := p_tutor_id::TEXT || '-' || p_student_id::TEXT;
    END IF;
    
    -- Try to find existing conversation
    SELECT id INTO existing_conversation_id
    FROM conversations
    WHERE student_tutor_pair_key = pair_key
    AND conversation_type = 'student_tutor';
    
    IF existing_conversation_id IS NOT NULL THEN
        RETURN existing_conversation_id;
    END IF;
    
    -- Create new conversation
    INSERT INTO conversations (title, conversation_type, created_by, student_tutor_pair_key)
    VALUES (
        COALESCE(p_title, 'Chat between student and tutor'),
        'student_tutor',
        p_student_id,
        pair_key
    )
    RETURNING id INTO new_conversation_id;
    
    -- Add participants
    INSERT INTO conversation_participants (conversation_id, user_id, role)
    VALUES 
        (new_conversation_id, p_student_id, 'student'),
        (new_conversation_id, p_tutor_id, 'tutor');
    
    RETURN new_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Add comment for the function
COMMENT ON FUNCTION find_or_create_student_tutor_conversation IS 'Safely find or create a conversation between a student and tutor, preventing duplicates'; 