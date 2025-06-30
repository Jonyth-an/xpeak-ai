import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AITaggingEngineEnhanced } from '../../../../lib/services/businessLogic/aiTaggingEngineEnhanced';
import { VocabularyManager } from '../../../../lib/services/businessLogic/vocabularyManager';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize components directly
const vocabularyManager = new VocabularyManager();
const aiTaggingEngine = new AITaggingEngineEnhanced({
  taggingConfidence: 0.7,
  maxTagsPerWord: 8,
  semanticSimilarityThreshold: 0.8,
  enableOpenAI: true,
  openAIModel: 'gpt-3.5-turbo',
  openAITemperature: 0.7,
  openAIMaxTokens: 500
});

// ========================================
// GET - GET UNLOCK CRITERIA FOR WORD
// ========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const word = searchParams.get('word');
    const userId = searchParams.get('userId');

    if (!word) {
      return NextResponse.json(
        { error: 'Word parameter is required' },
        { status: 400 }
      );
    }

    // Get word data
    const wordEntry = await vocabularyManager.getWordByText(word);
    if (!wordEntry) {
      return NextResponse.json(
        { error: 'Word not found' },
        { status: 404 }
      );
    }

    const wordData = await vocabularyManager.getCompleteWordData(wordEntry.id);
    if (!wordData) {
      return NextResponse.json(
        { error: 'Word data not found' },
        { status: 404 }
      );
    }

    // Generate enhanced unlock criteria using OpenAI
    const unlockCriteria = await aiTaggingEngine.generateMazeUnlockCriteria(wordData);

    // Get user progress for personalized criteria
    let personalizedCriteria: any[] = [];
    if (userId) {
      // Add basic personalized unlock criteria
      personalizedCriteria = [
        {
          unlockType: 'personal_achievement',
          criteria: `Master this word with 90% accuracy`,
          reward: 'Personal achievement badge',
          difficulty: 2,
          icon: '🎯',
          color: '#8B5CF6'
        },
        {
          unlockType: 'domain_exploration',
          criteria: `Learn 5 related words`,
          reward: 'Vocabulary collection badge',
          difficulty: 3,
          icon: '🎨',
          color: '#EC4899'
        }
      ];
    }

    return NextResponse.json({
      success: true,
      data: {
        word,
        unlockCriteria: [...unlockCriteria, ...personalizedCriteria],
        totalCriteria: unlockCriteria.length + personalizedCriteria.length
      }
    });

  } catch (error) {
    console.error('Error getting unlock criteria:', error);
    return NextResponse.json(
      { error: 'Failed to get unlock criteria' },
      { status: 500 }
    );
  }
} 