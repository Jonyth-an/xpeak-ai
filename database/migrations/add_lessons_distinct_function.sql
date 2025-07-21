-- Adds a function to get distinct lessons for a student by scheduled_start, scheduled_end, and tutor_id
CREATE OR REPLACE FUNCTION public.get_distinct_student_lessons(
  p_student_id uuid,
  p_upcoming boolean DEFAULT true,
  p_status text DEFAULT 'all',
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  tutor_id uuid,
  lesson_type varchar,
  duration_minutes integer,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  actual_start timestamptz,
  actual_end timestamptz,
  status varchar,
  lesson_notes text,
  student_goals text,
  homework_assigned text,
  price_paid numeric,
  currency varchar,
  created_at timestamptz,
  tutor_profile_id uuid,
  tutor_display_name varchar,
  tutor_profile_image_url varchar,
  tutor_bio text,
  tutor_timezone varchar
) AS $$
BEGIN
  RETURN QUERY
    SELECT DISTINCT ON (l.scheduled_start, l.scheduled_end, l.tutor_id)
      l.id,
      l.tutor_id,
      l.lesson_type,
      l.duration_minutes,
      l.scheduled_start,
      l.scheduled_end,
      l.actual_start,
      l.actual_end,
      l.status,
      l.lesson_notes,
      l.student_goals,
      l.homework_assigned,
      l.price_paid,
      l.currency,
      l.created_at,
      t.id as tutor_profile_id,
      t.display_name as tutor_display_name,
      t.profile_image_url as tutor_profile_image_url,
      t.bio as tutor_bio,
      t.timezone as tutor_timezone
    FROM lessons l
    INNER JOIN tutor_profiles t ON l.tutor_id = t.id
    WHERE l.student_id = p_student_id
      AND (
        (p_status = 'all') OR
        (l.status = ANY(string_to_array(p_status, ',')::varchar[]))
      )
      AND (
        (p_upcoming = true AND l.scheduled_start >= NOW()) OR
        (p_upcoming = false AND l.scheduled_start < NOW() AND l.status NOT IN ('pending', 'cancelled'))
      )
    ORDER BY l.scheduled_start, l.scheduled_end, l.tutor_id, l.created_at DESC
    OFFSET p_offset
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql; 