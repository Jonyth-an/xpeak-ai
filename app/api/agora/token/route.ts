import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function POST(request: NextRequest) {
  try {
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

    const { lessonId, channelName } = await request.json();

    if (!lessonId || !channelName) {
      return NextResponse.json({ error: 'Missing lessonId or channelName' }, { status: 400 });
    }

    // Verify user has access to this lesson
    const { data: lesson, error: lessonError } = await serverSupabase
      .from('lessons')
      .select('tutor_id, student_id')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Check if user is either the tutor or student
    const { data: tutorProfile } = await serverSupabase
      .from('tutor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const isTutor = tutorProfile?.id === lesson.tutor_id;
    const isStudent = user.id === lesson.student_id;

    if (!isTutor && !isStudent) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate Agora token
    const appID = process.env.AGORA_APP_ID!;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE!;
    const uid = Math.floor(Math.random() * 100000);
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    console.log('🔑 Generating Agora token with:', {
      appID: appID ? 'SET' : 'MISSING',
      appCertificate: appCertificate ? 'SET' : 'MISSING',
      channelName,
      uid,
      role,
      privilegeExpiredTs
    });

    const agoraToken = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs,
      privilegeExpiredTs
    );

    console.log('✅ Generated token:', agoraToken ? 'SUCCESS' : 'FAILED');

    // Update lesson with channel name and token
    await serverSupabase
      .from('lessons')
      .update({
        agora_channel_name: channelName,
        agora_token: agoraToken
      })
      .eq('id', lessonId);

    return NextResponse.json({
      token: agoraToken,
      channelName,
      uid,
      appID
    });

  } catch (error) {
    console.error('Error generating Agora token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 