import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BusinessLogicManager, getBusinessLogicConfig } from '../../../../lib/services/businessLogic';
import { serverSupabase } from '@/lib/serverSupabaseClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Business Logic Manager
const config = getBusinessLogicConfig();
const businessLogicManager = new BusinessLogicManager(config);

// ========================================
// GET - RETRIEVE LEARNING SESSIONS
// ========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get specific session
    if (sessionId) {
      const { data: session, error } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      return NextResponse.json({ session });
    }

    // Get user's learning sessions
    const { data: sessions, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    return NextResponse.json({ sessions: sessions || [] });

  } catch (error) {
    console.error('Error in GET /api/word-maze/sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ========================================
// POST - CREATE NEW LEARNING SESSION
// ========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { preferences } = body;

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Create personalized learning session using Business Logic Layer
    const session = await businessLogicManager.createPersonalizedLearningSession(
      user.id, 
      preferences || {}
    );

    // Save session to database
    const { data: savedSession, error: saveError } = await supabase
      .from('learning_sessions')
      .insert({
        id: session.id,
        user_id: session.userId,
        start_time: session.startTime.toISOString(),
        session_type: session.sessionType,
        difficulty: session.difficulty,
        words_learned: session.wordsLearned,
        words_reviewed: session.wordsReviewed,
        accuracy: session.accuracy,
        time_spent: session.timeSpent
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving session:', saveError);
      return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Learning session created successfully',
      session: savedSession 
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/word-maze/sessions:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

// ========================================
// PUT - UPDATE LEARNING SESSION
// ========================================

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { endTime, wordsLearned, wordsReviewed, accuracy, timeSpent } = body;

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const updateData: any = {};
    if (endTime !== undefined) updateData.end_time = endTime;
    if (wordsLearned !== undefined) updateData.words_learned = wordsLearned;
    if (wordsReviewed !== undefined) updateData.words_reviewed = wordsReviewed;
    if (accuracy !== undefined) updateData.accuracy = accuracy;
    if (timeSpent !== undefined) updateData.time_spent = timeSpent;

    const { data, error } = await supabase
      .from('learning_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating session:', error);
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Session updated successfully',
      session: data
    });

  } catch (error) {
    console.error('Error in PUT /api/word-maze/sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 