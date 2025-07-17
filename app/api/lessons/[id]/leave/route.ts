import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: lessonId } = await params;
    
    // Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get the UID from the request body
    let uid: number;
    try {
      const body = await request.json();
      uid = body?.uid;
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    if (!uid) {
      return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    // Update the participant record to mark them as left
    const { error: updateError } = await serverSupabase
      .from('lesson_participants')
      .update({
        left_at: new Date().toISOString()
      })
      .eq('lesson_id', lessonId)
      .eq('user_id', user.id)
      .eq('uid', uid);

    if (updateError) {
      console.error('Error updating participant record:', updateError);
      // Don't return error, just log it as the user is leaving anyway
    }

    console.log(`✅ User ${user.id} left lesson ${lessonId} with UID ${uid}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error leaving lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 