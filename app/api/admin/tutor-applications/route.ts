import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';
import { requireAdminAuth } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const adminUser = authResult.user;

    const supabase = serverSupabase;
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const language = searchParams.get('language') || 'all';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('tutor_applications')
      .select(`
        id,
        user_id,
        application_data,
        status,
        created_at,
        updated_at,
        review_notes,
        rejection_reason,
        waitlist_reason,
        reviewer_email
      `);

    // Apply filters
    if (search) {
      query = query.or(`application_data->>'fullName'.ilike.%${search}%,application_data->>'userEmail'.ilike.%${search}%`);
    }

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (language !== 'all') {
      query = query.eq('application_data->nativeLanguage', language);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: applications, error, count } = await query;

    if (error) {
      console.error('Error fetching tutor applications:', error);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }

    // Process applications to extract data from JSONB
    const processedApplications = (applications || []).map(app => ({
      id: app.id,
      user_email: app.application_data?.userEmail || '',
      full_name: app.application_data?.fullName || '',
      native_language: app.application_data?.nativeLanguage || '',
      current_country: app.application_data?.currentCountry || '',
      weekly_hours: app.application_data?.weeklyHours ? `${app.application_data.weeklyHours} hours/week` : '',
      certificates: app.application_data?.certificates || [],
      certificate_count: (app.application_data?.certificates || []).length,
      status: app.status,
      created_at: app.created_at,
      updated_at: app.updated_at,
      reviewer_notes: app.review_notes,
      rejection_reason: app.rejection_reason,
      waitlist_reason: app.waitlist_reason,
      avatar_url: null // Avatar URL will be fetched separately if needed
    }));

    // Get total count for pagination
    let totalCount = 0;
    if (count !== null) {
      totalCount = count;
    } else {
      // Fallback: get total count separately
      const { count: total } = await supabase
        .from('tutor_applications')
        .select('*', { count: 'exact', head: true });
      totalCount = total || 0;
    }

    return NextResponse.json({
      applications: processedApplications,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error in tutor applications API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const adminUser = authResult.user;

    const supabase = serverSupabase;

    // Get request body
    const { 
      applicationId, 
      status, 
      reviewNotes, 
      rejectionReason, 
      waitlistReason 
    } = await request.json();

    if (!applicationId || !status) {
      return NextResponse.json({ error: 'Application ID and status are required' }, { status: 400 });
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
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating tutor application:', error);
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
    }

    return NextResponse.json({
      application,
      message: 'Application updated successfully'
    });

  } catch (error) {
    console.error('Error in tutor applications PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 