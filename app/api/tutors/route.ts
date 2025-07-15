import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get the user from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    // Get user from Supabase
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    if (authError || !user) {
      console.error('Auth error or no user:', authError, user);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Check if user has student role
    const { data: roleRows, error: roleError } = await serverSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'student');
    if (roleError || !roleRows || roleRows.length === 0) {
      console.error('Role error or no student role:', roleError, roleRows);
      return NextResponse.json({ error: 'Access denied. Student role required.' }, { status: 403 });
    }
    // Fetch all active tutors using existing columns
    const { data: tutors, error: tutorsError } = await serverSupabase
      .from('tutor_profiles')
      .select(`
        id,
        display_name,
        profile_image_url,
        bio,
        hourly_rate,
        languages_taught,
        specializations,
        is_active
      `)
      .eq('is_active', true);
    if (tutorsError) {
      console.error('Tutors fetch error:', tutorsError);
      return NextResponse.json({ error: 'Failed to fetch tutors', details: tutorsError }, { status: 500 });
    }
    if (!tutors) {
      console.error('Tutors data is null or undefined');
      return NextResponse.json({ error: 'No tutors data returned' }, { status: 500 });
    }
    // For each tutor, fetch review count, average rating, and lesson count (mock 0 for now if not available)
    let tutorList;
    try {
      tutorList = await Promise.all((tutors || []).map(async (tutor) => {
        // Extract accent from languages_taught if available
        const accent = tutor.languages_taught && tutor.languages_taught.length > 0 
          ? tutor.languages_taught[0].language 
          : 'N/A';
        
        return {
          id: tutor.id,
          name: tutor.display_name,
          profile_image_url: tutor.profile_image_url,
          accent: accent,
          certificates: tutor.specializations || [], // Use specializations as certificates
          average_rating: 0, // Placeholder
          review_count: 0,   // Placeholder
          lesson_count: 0    // Placeholder
        };
      }));
    } catch (mapError) {
      console.error('Error mapping tutors:', mapError, tutors);
      return NextResponse.json({ error: 'Error mapping tutors', details: mapError }, { status: 500 });
    }
    return NextResponse.json({ tutors: tutorList });
  } catch (error) {
    console.error('Error in tutors GET:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 