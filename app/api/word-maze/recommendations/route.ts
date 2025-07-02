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
// GET - GET WORD RECOMMENDATIONS
// ========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '10');
    const difficulty = searchParams.get('difficulty');
    const tags = searchParams.get('tags')?.split(',');
    const excludeLearned = searchParams.get('excludeLearned') === 'true';

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

    // Get personalized word recommendations using Business Logic Layer
    const recommendedWordIds = await businessLogicManager.generateWordRecommendations(user.id, count);

    // Get detailed word data for recommendations
    const { data: recommendedWords, error: wordsError } = await supabase
      .from('word_entries')
      .select(`
        *,
        word_definitions (*),
        word_examples (*),
        word_synonyms (*),
        word_antonyms (*)
      `)
      .in('id', recommendedWordIds);

    if (wordsError) {
      console.error('Error fetching recommended words:', wordsError);
      return NextResponse.json({ error: 'Failed to fetch recommended words' }, { status: 500 });
    }

    // Filter by difficulty if specified
    let filteredWords = recommendedWords || [];
    if (difficulty) {
      filteredWords = filteredWords.filter(word => word.difficulty_level === difficulty);
    }

    // Filter by tags if specified
    if (tags && tags.length > 0) {
      filteredWords = filteredWords.filter(word => 
        word.tags && tags.some(tag => word.tags.includes(tag))
      );
    }

    // Exclude already learned words if requested
    if (excludeLearned) {
      const { data: learnedWords, error: learnedError } = await supabase
        .from('user_word_progress')
        .select('word_id')
        .eq('user_id', user.id)
        .gte('mastery_level', 80); // Consider words with 80%+ mastery as learned

      if (!learnedError && learnedWords) {
        const learnedWordIds = learnedWords.map(w => w.word_id);
        filteredWords = filteredWords.filter(word => !learnedWordIds.includes(word.id));
      }
    }

    return NextResponse.json({
      recommendations: filteredWords.slice(0, count),
      total: filteredWords.length,
      userLevel: 'intermediate', // This would come from adaptive learning engine
      nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    });

  } catch (error) {
    console.error('Error in GET /api/word-maze/recommendations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ========================================
// POST - CREATE CUSTOM LEARNING PATH
// ========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, wordIds, objectives, preferences } = body;

    if (!name || !wordIds || !Array.isArray(wordIds)) {
      return NextResponse.json({ error: 'Name and word IDs array are required' }, { status: 400 });
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

    // Create custom learning path using Business Logic Layer
    const learningPath = await businessLogicManager.createCustomLearningPath(
      user.id,
      name,
      description || '',
      wordIds
    );

    // Save learning path to database
    const { data: savedPath, error: saveError } = await supabase
      .from('learning_paths')
      .insert({
        id: learningPath.id,
        user_id: learningPath.userId,
        name: learningPath.name,
        description: learningPath.description,
        difficulty: learningPath.difficulty,
        estimated_duration: learningPath.estimatedDuration,
        word_count: learningPath.wordCount,
        tags: learningPath.tags,
        is_adaptive: learningPath.isAdaptive,
        objectives: objectives || [],
        preferences: preferences || {}
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving learning path:', saveError);
      return NextResponse.json({ error: 'Failed to save learning path' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Custom learning path created successfully',
      learningPath: savedPath
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/word-maze/recommendations:', error);
    return NextResponse.json({ error: 'Failed to create learning path' }, { status: 500 });
  }
}

// ========================================
// PUT - UPDATE LEARNING PREFERENCES
// ========================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { preferences, learningGoals, difficultyPreference } = body;

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

    // Update user learning preferences
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (preferences !== undefined) updateData.learning_preferences = preferences;
    if (learningGoals !== undefined) updateData.learning_goals = learningGoals;
    if (difficultyPreference !== undefined) updateData.difficulty_preference = difficultyPreference;

    const { data, error } = await supabase
      .from('user_learning_preferences')
      .upsert({
        user_id: user.id,
        ...updateData
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating learning preferences:', error);
      return NextResponse.json({ error: 'Failed to update learning preferences' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Learning preferences updated successfully',
      preferences: data
    });

  } catch (error) {
    console.error('Error in PUT /api/word-maze/recommendations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 