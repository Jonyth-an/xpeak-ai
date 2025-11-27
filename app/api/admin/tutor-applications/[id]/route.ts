import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';
import { requireAdminAuth } from '@/lib/adminAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const supabase = serverSupabase;
    const { id } = await params;

    // Get the application
    const { data: application, error } = await supabase
      .from('tutor_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching tutor application:', error);
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // For now, let's just use the original URLs without processing
    // The JWT token issue might be resolved by using the original URLs directly
    console.log('Original demo video URL:', application.application_data?.demoVideo); // Debug log

    // Process the application data to extract fields from JSONB
    const processedApplication = {
      id: application.id,
      user_id: application.user_id,
      user_email: application.application_data?.userEmail || '',
      full_name: application.application_data?.fullName || '',
      display_name: application.application_data?.displayName || '',
      native_language: application.application_data?.nativeLanguage || '',
      accent: application.application_data?.accent || '',
      birth_country: application.application_data?.birthCountry || '',
      current_country: application.application_data?.currentCountry || '',
      timezone: application.application_data?.timezone || '',
      introduction: application.application_data?.introduction || '',
      education: application.application_data?.education || '',
      teaching_experience: application.application_data?.teachingExperience || '',
      weekly_hours: application.application_data?.weeklyHours || '',
      motivation: application.application_data?.motivation || '',
      linkedin: application.application_data?.linkedin || '',
      social_media: application.application_data?.socialMedia || '',
      languages_spoken: application.application_data?.languagesSpoken || [],
      profile_photos: application.application_data?.profilePhotos || [],
      certificates: application.application_data?.certificates || [],
      certificate_other: application.application_data?.certificateOther || '',
      certificate_files: application.application_data?.certificateFiles || [],
      teaching_screenshot: application.application_data?.teachingScreenshot || '',
      demo_video: application.application_data?.demoVideo || '',
      status: application.status,
      created_at: application.created_at,
      updated_at: application.updated_at,
      submitted_at: application.submitted_at,
      reviewed_at: application.reviewed_at,
      reviewer_notes: application.review_notes,
      rejection_reason: application.rejection_reason,
      waitlist_reason: application.waitlist_reason,
      reviewer_id: application.reviewer_id,
      reviewer_email: application.reviewer_email,
      admin_action_history: application.admin_action_history || [],
      avatar_url: null // Avatar URL will be fetched separately if needed
    };

    return NextResponse.json({ application: processedApplication });

  } catch (error) {
    console.error('Error in tutor application detail API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const adminUser = authResult.user;

    const supabase = serverSupabase;
    const { id } = await params;

    // Get request body
    const { status, reviewNotes, rejectionReason, waitlistReason, notesOnly } = await request.json();

    // If notesOnly is true, we're just updating notes without changing status
    if (notesOnly) {
      if (reviewNotes === undefined) {
        return NextResponse.json({ error: 'Review notes are required for notes-only update' }, { status: 400 });
      }

      // Update only the review notes
      const updateData = {
        review_notes: reviewNotes,
        reviewer_id: adminUser.id,
        reviewer_email: adminUser.email,
        reviewed_at: new Date().toISOString()
      };

      const { data: application, error } = await supabase
        .from('tutor_applications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating review notes:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return NextResponse.json({ 
          error: 'Failed to update review notes',
          details: error.message,
          code: error.code
        }, { status: 500 });
      }

      if (!application) {
        console.error('Review notes update returned no data');
        return NextResponse.json({ 
          error: 'Review notes update completed but no data was returned' 
        }, { status: 500 });
      }

      return NextResponse.json({
        application,
        message: 'Review notes updated successfully'
      });
    }

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['pending', 'reviewing', 'waitlist', 'rejected', 'approved'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Build update data
    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString(),
      reviewer_id: adminUser.id,
      reviewer_email: adminUser.email
    };

    if (reviewNotes !== undefined) {
      updateData.review_notes = reviewNotes;
    }

    if (rejectionReason !== undefined) {
      updateData.rejection_reason = rejectionReason;
    }

    if (waitlistReason !== undefined) {
      updateData.waitlist_reason = waitlistReason;
    }

    // Update the application
    const { data: application, error } = await supabase
      .from('tutor_applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tutor application:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Update data:', JSON.stringify(updateData, null, 2));
      console.error('Application ID:', id);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to update application';
      let errorDetails = error.message || 'Unknown error';
      
      if (error.code === 'PGRST116') {
        errorMessage = 'Application not found';
      } else if (error.message) {
        // Check for specific database errors
        if (error.message.includes('hourly_rate')) {
          errorMessage = 'Database configuration error: hourly_rate column issue';
          errorDetails = 'The database trigger function needs to be updated. Please run the migration: database/migrations/fix_tutor_profile_trigger_no_hourly_rate.sql';
        } else if (error.message.includes('column') && error.message.includes('does not exist')) {
          errorMessage = 'Database schema error';
          errorDetails = error.message;
        } else {
          errorMessage = `Failed to update application: ${error.message}`;
        }
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: errorDetails,
        code: error.code,
        hint: error.message?.includes('hourly_rate') 
          ? 'Run: node scripts/fix-tutor-profile-trigger.js or apply the migration manually'
          : undefined
      }, { status: 500 });
    }

    if (!application) {
      console.error('Application update returned no data');
      return NextResponse.json({ 
        error: 'Application update completed but no data was returned' 
      }, { status: 500 });
    }

    return NextResponse.json({
      application,
      message: 'Application updated successfully'
    });

  } catch (error) {
    console.error('Error in tutor application review API:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorMessage
    }, { status: 500 });
  }
} 