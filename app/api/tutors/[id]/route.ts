import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('=== TUTOR API CALLED ===');
    console.log('Fetching tutor with ID:', id);
    console.log('Request URL:', request.url);

    // Query the tutor_profiles table for the specific tutor
    const { data: tutor, error } = await supabase
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
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.log('Database error:', error);
      console.log('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    if (!tutor) {
      console.log('No tutor found for ID:', id);
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    // Transform the data to match the expected format
    const transformedTutor = {
      id: tutor.id,
      name: tutor.display_name,
      profile_image_url: tutor.profile_image_url,
      accent: tutor.languages_taught?.[0]?.language || 'English',
      certificates: tutor.specializations || [],
      average_rating: 5.0, // Placeholder
      review_count: 0, // Placeholder
      lesson_count: 0, // Placeholder
      bio: tutor.bio,
      hourly_rate: tutor.hourly_rate
    };

    console.log('Found tutor:', transformedTutor);

    return NextResponse.json({ tutor: transformedTutor });

  } catch (error) {
    console.log('Error fetching tutor:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 