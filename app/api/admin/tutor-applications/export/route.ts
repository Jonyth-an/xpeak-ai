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

    const supabase = serverSupabase;
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const language = searchParams.get('language') || 'all';

    // Build query
    let query = supabase
      .from('tutor_applications')
      .select('*');

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

    // Get all applications
    const { data: applications, error } = await query;

    if (error) {
      console.error('Error fetching applications for export:', error);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }

    // Process applications to extract data from JSONB
    const processedApplications = (applications || []).map(app => ({
      id: app.id,
      full_name: app.application_data?.fullName || '',
      user_email: app.application_data?.userEmail || '',
      native_language: app.application_data?.nativeLanguage || '',
      accent: app.application_data?.accent || '',
      birth_country: app.application_data?.birthCountry || '',
      current_country: app.application_data?.currentCountry || '',
      timezone: app.application_data?.timezone || '',
      status: app.status,
      created_at: app.created_at,
      updated_at: app.updated_at,
      reviewer_notes: app.review_notes,
      rejection_reason: app.rejection_reason,
      waitlist_reason: app.waitlist_reason,
      reviewer_email: app.reviewer_email,
      reviewed_at: app.reviewed_at
    }));

    // Convert to CSV
    const csvHeaders = [
      'ID',
      'Full Name',
      'Email',
      'Native Language',
      'Accent',
      'Birth Country',
      'Current Country',
      'Timezone',
      'Status',
      'Created At',
      'Updated At',
      'Reviewer Notes',
      'Rejection Reason',
      'Waitlist Reason',
      'Reviewer Email',
      'Reviewed At'
    ];

    const csvRows = processedApplications.map(app => [
      app.id,
      app.full_name,
      app.user_email,
      app.native_language,
      app.accent,
      app.birth_country,
      app.current_country,
      app.timezone,
      app.status,
      app.created_at,
      app.updated_at,
      app.reviewer_notes,
      app.rejection_reason,
      app.waitlist_reason,
      app.reviewer_email,
      app.reviewed_at
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="tutor-applications-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Error in tutor applications export API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 