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
    
    console.log('=== TUTOR PROFILE API CALLED ===');
    console.log('Fetching tutor profile with ID:', id);

    // Query the tutor_profiles table for the specific tutor
    const { data: tutor, error } = await supabase
      .from('tutor_profiles')
      .select(`
        id,
        display_name,
        profile_image_url,
        bio,
        teaching_style,
        education,
        languages_taught,
        languages_spoken,
        specializations,
        certifications,
        intro_video_url,
        certificate_files,
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
      bio: tutor.bio,
      teaching_style: tutor.teaching_style,
      education: tutor.education,
      languages_taught: tutor.languages_taught || [],
      languages_spoken: tutor.languages_spoken || [],
      specializations: tutor.specializations || [],
      intro_video_url: tutor.intro_video_url,
      certificate_files: tutor.certificate_files || [],
      accent: tutor.languages_taught?.[0]?.language || 'English',
      certificates: tutor.certifications || [],
      average_rating: 5.0, // Placeholder
      review_count: 0, // Placeholder
      lesson_count: 0, // Placeholder
    };

    // Generate fresh signed URL for video if it exists
    let freshVideoUrl = tutor.intro_video_url;
    if (tutor.intro_video_url) {
      try {
        // Extract the file path from the existing URL
        const urlMatch = tutor.intro_video_url.match(/\/demo-videos\/([^?]+)/);
        if (urlMatch) {
          const filePath = urlMatch[1];
          console.log('🔍 Extracted file path:', filePath);
          
          // Generate a fresh signed URL
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('demo-videos')
            .createSignedUrl(filePath, 3600); // 1 hour expiration
          
          if (signedUrlError) {
            console.log('❌ Error generating signed URL:', signedUrlError);
          } else if (signedUrlData?.signedUrl) {
            freshVideoUrl = signedUrlData.signedUrl;
            console.log('✅ Generated fresh video URL:', freshVideoUrl);
          }
        }
      } catch (videoError) {
        console.log('⚠️ Could not generate fresh video URL:', videoError);
      }
    }

    // Update the transformed tutor with the fresh video URL
    transformedTutor.intro_video_url = freshVideoUrl;
    
    console.log('✅ Found tutor:', transformedTutor);
    
    return NextResponse.json({ tutor: transformedTutor });
  } catch (error) {
    console.log('Error fetching tutor profile:', error);
    return NextResponse.json(
      { error: `Error fetching tutor: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 