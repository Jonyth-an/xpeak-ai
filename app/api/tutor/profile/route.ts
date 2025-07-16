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

    // Check if user has tutor role
    const { data: roleData, error: roleError } = await serverSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'tutor')
      .single();

    if (roleError || !roleData) {
      return NextResponse.json({ error: 'Access denied. Tutor role required.' }, { status: 403 });
    }

    // Fetch tutor profile
    console.log('🔍 Fetching tutor profile for user:', user.id);
    
    const { data: profile, error: profileError } = await serverSupabase
      .from('tutor_profiles')
      .select(`
        id,
        user_id,
        application_id,
        display_name,
        bio,
        teaching_style,
        education,
        timezone,
        ip_timezone,
        timezone_confirmed,
        languages_taught,
        specializations,
        certifications,
        profile_image_url,
        intro_video_url,
        certificate_files,
        is_active,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching tutor profile:', profileError);
      console.error('❌ Error details:', JSON.stringify(profileError, null, 2));
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
    
    console.log('✅ Successfully fetched tutor profile:', profile);

    // Get IP-based timezone from request headers (if available)
    const ipTimezone = request.headers.get('x-timezone') || 
                      request.headers.get('cf-timezone') || 
                      null;

    // Update IP timezone if different and not already set
    if (ipTimezone && (!profile.ip_timezone || profile.ip_timezone !== ipTimezone)) {
      await serverSupabase
        .from('tutor_profiles')
        .update({ 
          ip_timezone: ipTimezone,
          timezone_confirmed: profile.timezone === ipTimezone 
        })
        .eq('user_id', user.id);
      
      profile.ip_timezone = ipTimezone;
      profile.timezone_confirmed = profile.timezone === ipTimezone;
    }

    return NextResponse.json({ 
      profile 
    });

  } catch (error) {
    console.error('Error in tutor profile GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    // Check if user has tutor role
    const { data: roleData, error: roleError } = await serverSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'tutor')
      .single();

    if (roleError || !roleData) {
      return NextResponse.json({ error: 'Access denied. Tutor role required.' }, { status: 403 });
    }

    const { 
      display_name, 
      bio, 
      teaching_style,
      education,
      timezone, 
      languages_taught, 
      specializations,
      certifications,
      profile_image_url,
      intro_video_url,
      certificate_files,
      timezone_confirmed 
    } = await request.json();

    // Build update data
    const updateData: any = {};
    
    if (display_name !== undefined) updateData.display_name = display_name;
    if (bio !== undefined) updateData.bio = bio;
    if (teaching_style !== undefined) updateData.teaching_style = teaching_style;
    if (education !== undefined) updateData.education = education;
    if (timezone !== undefined) {
      updateData.timezone = timezone;
      updateData.timezone_confirmed = timezone_confirmed || false;
    }
    if (languages_taught !== undefined) updateData.languages_taught = languages_taught;
    if (specializations !== undefined) updateData.specializations = specializations;
    if (certifications !== undefined) updateData.certifications = certifications;
    if (profile_image_url !== undefined) updateData.profile_image_url = profile_image_url;
    if (intro_video_url !== undefined) updateData.intro_video_url = intro_video_url;
    if (certificate_files !== undefined) updateData.certificate_files = certificate_files;
    if (timezone_confirmed !== undefined) updateData.timezone_confirmed = timezone_confirmed;

    // Update tutor profile
    const { data: profile, error: updateError } = await serverSupabase
      .from('tutor_profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating tutor profile:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({
      profile,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error in tutor profile PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 