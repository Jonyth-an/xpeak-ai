import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get the user from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user from Supabase
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the tutor profile for the current user
    const { data: tutorProfile, error: tutorError } = await serverSupabase
      .from('tutor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tutorError || !tutorProfile) {
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }

    // Fetch pending reschedule requests for lessons where this tutor is the tutor
    const { data: rescheduleRequests, error: requestsError } = await serverSupabase
      .from('reschedule_requests')
      .select(`
        id,
        lesson_id,
        requested_by,
        requested_date,
        requested_start_time,
        requested_end_time,
        reason,
        status,
        created_at,
        lesson:lessons!inner(
          id,
          lesson_type,
          duration_minutes,
          scheduled_start,
          scheduled_end,
          student_id
        )
      `)
      .eq('lesson.tutor_id', tutorProfile.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (requestsError) {
      console.error('Error fetching reschedule requests:', requestsError);
      return NextResponse.json({ error: 'Failed to fetch reschedule requests' }, { status: 500 });
    }

    // Get student information for each request
    const requestsWithStudentInfo = await Promise.all(
      (rescheduleRequests || []).map(async (request: any) => {
        if (request.lesson?.student_id) {
          try {
            const { data: studentData, error: studentError } = await serverSupabase
              .from('users')
              .select(`
                id,
                email,
                profiles!users_id_fkey(
                  first_name,
                  last_name
                )
              `)
              .eq('id', request.lesson.student_id)
              .single();

            if (studentError) {
              console.error('Error fetching student data:', studentError);
              // Return request with basic student info
              return {
                ...request,
                lesson: {
                  ...request.lesson,
                  student: {
                    id: request.lesson.student_id,
                    email: 'Unknown',
                    name: 'Student'
                  }
                }
              };
            }

            // Format student name from profile data
            const studentName = studentData?.profiles?.[0] 
              ? `${studentData.profiles[0].first_name || ''} ${studentData.profiles[0].last_name || ''}`.trim() || 'Student'
              : 'Student';

            return {
              ...request,
              lesson: {
                ...request.lesson,
                student: {
                  id: studentData.id,
                  email: studentData.email,
                  name: studentName
                }
              }
            };
          } catch (error) {
            console.error('Error processing student data:', error);
            return {
              ...request,
              lesson: {
                ...request.lesson,
                student: {
                  id: request.lesson.student_id,
                  email: 'Unknown',
                  name: 'Student'
                }
              }
            };
          }
        }
        return request;
      })
    );

    console.log('🔍 Found reschedule requests:', requestsWithStudentInfo);

    return NextResponse.json({
      requests: requestsWithStudentInfo || []
    });

  } catch (error) {
    console.error('Error in pending reschedule requests API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 