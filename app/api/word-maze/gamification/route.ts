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
// GET - RETRIEVE GAMIFICATION DATA
// ========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

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

    // Get user's gamification data
    const { data: gamificationData, error } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching gamification data:', error);
      return NextResponse.json({ error: 'Failed to fetch gamification data' }, { status: 500 });
    }

    // If no gamification data exists, create default data
    if (!gamificationData) {
      const defaultData = {
        user_id: user.id,
        total_points: 0,
        level: 1,
        streak: 0,
        achievements: [],
        badges: [],
        last_activity: new Date().toISOString()
      };

      const { data: newData, error: createError } = await supabase
        .from('user_gamification')
        .insert(defaultData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating gamification data:', createError);
        return NextResponse.json({ error: 'Failed to create gamification data' }, { status: 500 });
      }

      return NextResponse.json({ gamification: newData });
    }

    return NextResponse.json({ gamification: gamificationData });

  } catch (error) {
    console.error('Error in GET /api/word-maze/gamification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ========================================
// POST - PROCESS WORD INTERACTION
// ========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wordId, isCorrect, timeTaken, interactionType = 'learn' } = body;

    if (!wordId || isCorrect === undefined) {
      return NextResponse.json({ error: 'Word ID and correctness are required' }, { status: 400 });
    }

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

    // Process word interaction using Business Logic Layer
    const result = await businessLogicManager.processWordInteraction(
      user.id,
      wordId,
      isCorrect,
      timeTaken || 0
    );

    // Update gamification data
    const { data: currentGamification, error: fetchError } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching current gamification data:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch gamification data' }, { status: 500 });
    }

    const updatedGamification = {
      user_id: user.id,
      total_points: (currentGamification?.total_points || 0) + result.gamificationUpdate.totalPoints,
      level: result.gamificationUpdate.level,
      streak: result.gamificationUpdate.streak,
      achievements: result.gamificationUpdate.achievements,
      badges: result.gamificationUpdate.badges,
      last_activity: new Date().toISOString()
    };

    const { data: savedGamification, error: saveError } = await supabase
      .from('user_gamification')
      .upsert(updatedGamification, { onConflict: 'user_id' })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving gamification data:', saveError);
      return NextResponse.json({ error: 'Failed to save gamification data' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Interaction processed successfully',
      updatedProgress: result.updatedProgress,
      gamification: savedGamification,
      nextWord: result.nextWord
    });

  } catch (error) {
    console.error('Error in POST /api/word-maze/gamification:', error);
    return NextResponse.json({ error: 'Failed to process interaction' }, { status: 500 });
  }
}

// ========================================
// PUT - UPDATE GAMIFICATION DATA
// ========================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { totalPoints, level, streak, achievements, badges } = body;

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

    const updateData: any = {
      last_activity: new Date().toISOString()
    };

    if (totalPoints !== undefined) updateData.total_points = totalPoints;
    if (level !== undefined) updateData.level = level;
    if (streak !== undefined) updateData.streak = streak;
    if (achievements !== undefined) updateData.achievements = achievements;
    if (badges !== undefined) updateData.badges = badges;

    const { data, error } = await supabase
      .from('user_gamification')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating gamification data:', error);
      return NextResponse.json({ error: 'Failed to update gamification data' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Gamification data updated successfully',
      gamification: data
    });

  } catch (error) {
    console.error('Error in PUT /api/word-maze/gamification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 