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

    return NextResponse.json({ application });

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
    const { status, reviewNotes, rejectionReason, waitlistReason } = await request.json();

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
      updateData.reviewer_notes = reviewNotes;
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
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
    }

    return NextResponse.json({
      application,
      message: 'Application updated successfully'
    });

  } catch (error) {
    console.error('Error in tutor application review API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 