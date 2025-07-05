import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AITaggingEngineEnhanced } from '../../../../lib/services/businessLogic/aiTaggingEngineEnhanced';
import { VocabularyManager } from '../../../../lib/services/vocabularyManager';

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
// GET - GET ENHANCED TAGS FOR WORD
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
      return NextResponse.json({
        success: true,
        data: {
          word,
          tags: [],
          unlockCriteria: [],
          personalizedTags: [],
          wordData: { word, definitions: [], examples: [], tags: [], relationships: [] }
        }
      });
    }

    const wordData = await vocabularyManager.getCompleteWordData(wordEntry.id);
    if (!wordData) {
      return NextResponse.json({
        success: true,
        data: {
          word,
          tags: [],
          unlockCriteria: [],
          personalizedTags: [],
          wordData: { word, definitions: [], examples: [], tags: [], relationships: [] }
        }
      });
    }

    // Generate enhanced tags
    const enhancedTags = await aiTaggingEngine.generateTags(wordData);
    const unlockCriteria = await aiTaggingEngine.generateMazeUnlockCriteria(wordData);
    
    // Generate personalized tags if user ID provided
    let personalizedTags: any[] = [];
    if (userId) {
      try {
        personalizedTags = await aiTaggingEngine.generatePersonalizedTags(userId, wordData);
      } catch (error) {
        console.warn('Failed to generate personalized tags:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        word,
        tags: enhancedTags,
        unlockCriteria,
        personalizedTags,
        wordData
      }
    });

  } catch (error) {
    console.error('Error getting enhanced tags:', error);
    return NextResponse.json(
      { error: 'Failed to get enhanced tags' },
      { status: 500 }
    );
  }
}

// ========================================
// POST - GENERATE ENHANCED TAGS FOR MULTIPLE WORDS
// ========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { words, userId } = body;

    if (!words || !Array.isArray(words)) {
      return NextResponse.json(
        { error: 'Words array is required' },
        { status: 400 }
      );
    }

    // Process multiple words with enhanced AI tagging
    const enhancedResults = await Promise.all(
      words.map(async (word: string) => {
        try {
          // Get word data
          const wordEntry = await vocabularyManager.getWordByText(word);
          if (!wordEntry) {
            return {
              word,
              success: true,
              data: {
                tags: [],
                unlockCriteria: [],
                personalizedTags: [],
                wordData: { word, definitions: [], examples: [], tags: [], relationships: [] }
              }
            };
          }

          const wordData = await vocabularyManager.getCompleteWordData(wordEntry.id);
          if (!wordData) {
            return {
              word,
              success: true,
              data: {
                tags: [],
                unlockCriteria: [],
                personalizedTags: [],
                wordData: { word, definitions: [], examples: [], tags: [], relationships: [] }
              }
            };
          }

          // Generate enhanced tags
          const enhancedTags = await aiTaggingEngine.generateTags(wordData);
          const unlockCriteria = await aiTaggingEngine.generateMazeUnlockCriteria(wordData);
          
          // Generate personalized tags if user ID provided
          let personalizedTags: any[] = [];
          if (userId) {
            try {
              personalizedTags = await aiTaggingEngine.generatePersonalizedTags(userId, wordData);
            } catch (error) {
              console.warn(`Failed to generate personalized tags for ${word}:`, error);
            }
          }

          return {
            word,
            success: true,
            data: {
              tags: enhancedTags,
              unlockCriteria,
              personalizedTags,
              wordData
            }
          };
        } catch (error) {
          console.error(`Error processing word ${word}:`, error);
          return {
            word,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: enhancedResults
    });

  } catch (error) {
    console.error('Error processing enhanced tags batch:', error);
    return NextResponse.json(
      { error: 'Failed to process enhanced tags' },
      { status: 500 }
    );
  }
} 