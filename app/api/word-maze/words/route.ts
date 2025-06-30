import { NextRequest, NextResponse } from 'next/server';
import { vocabularyManager } from '../../../../lib/services/vocabularyManager';
import { apiAggregator } from '../../../../lib/services/apiAggregator';
import { createClient } from '@supabase/supabase-js';
import { VocabularyType } from '../../../../lib/types/wordMaze';

// ========================================
// SUPABASE CLIENT
// ========================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ========================================
// GET - SEARCH AND RETRIEVE WORDS
// ========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const wordId = searchParams.get('id');
    const difficulty = searchParams.get('difficulty');
    const typeParam = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get word by ID
    if (wordId) {
      const word = await vocabularyManager.getWordById(wordId);
      if (!word) {
        return NextResponse.json({ error: 'Word not found' }, { status: 404 });
      }

      const completeData = await vocabularyManager.getCompleteWordData(wordId);
      return NextResponse.json({ word: completeData });
    }

    // Search words by query
    if (query) {
      const words = await vocabularyManager.searchWords(query, limit);
      return NextResponse.json({ words });
    }

    // Get words by difficulty
    if (difficulty) {
      const words = await vocabularyManager.getWordsByDifficulty(difficulty, limit);
      return NextResponse.json({ words });
    }

    // Get words by type
    if (typeParam) {
      // Validate that the type parameter is a valid VocabularyType
      const validTypes: VocabularyType[] = ['word', 'slang', 'idiom', 'phrase', 'collocation', 'phrasal_verb'];
      if (!validTypes.includes(typeParam as VocabularyType)) {
        return NextResponse.json(
          { error: `Invalid vocabulary type. Must be one of: ${validTypes.join(', ')}` }, 
          { status: 400 }
        );
      }
      
      const type = typeParam as VocabularyType;
      const words = await vocabularyManager.getWordsByType(type, limit);
      return NextResponse.json({ words });
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('word_entries')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching total count:', countError);
      return NextResponse.json({ error: 'Failed to fetch total count' }, { status: 500 });
    }

    // Get all words (with pagination)
    const { data: wordEntries, error } = await supabase
      .from('word_entries')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching words:', error);
      return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
    }

    // Get complete word data including definitions for each word
    const wordsWithCompleteData = await Promise.all(
      wordEntries.map(async (entry) => {
        try {
          const completeData = await vocabularyManager.getCompleteWordData(entry.id);
          if (completeData) {
            // Combine basic entry data with complete word data
            return {
              ...completeData,
              id: entry.id,
              created_at: entry.created_at,
              updated_at: entry.updated_at,
              is_verified: entry.is_verified,
              verification_source: entry.verification_source
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching complete data for word ${entry.id}:`, error);
          // Return basic word data if complete data fetch fails
          return {
            word: entry.word_text,
            type: entry.type,
            definitions: [],
            examples: [],
            tags: [],
            relationships: [],
            difficulty: {
              level: entry.difficulty_level,
              score: entry.difficulty_score
            },
            metadata: entry.metadata,
            id: entry.id,
            created_at: entry.created_at,
            updated_at: entry.updated_at,
            is_verified: entry.is_verified,
            verification_source: entry.verification_source
          };
        }
      })
    );

    // Filter out null values
    const validWords = wordsWithCompleteData.filter(word => word !== null);

    return NextResponse.json({ 
      words: validWords,
      total: totalCount || 0,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil((totalCount || 0) / limit)
    });

  } catch (error) {
    console.error('Error in GET /api/word-maze/words:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// ========================================
// POST - ADD NEW WORD
// ========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, words, source } = body;

    console.log('POST request body:', body);

    // Handle both single word and bulk word requests
    let wordsToAdd: string[] = [];

    if (words && Array.isArray(words)) {
      // Bulk word request
      wordsToAdd = words.filter(w => w && typeof w === 'string' && w.trim().length > 0);
    } else if (word && typeof word === 'string') {
      // Single word request
      wordsToAdd = [word.trim()];
    } else {
      return NextResponse.json(
        { error: 'Either "word" (string) or "words" (array) is required' }, 
        { status: 400 }
      );
    }

    if (wordsToAdd.length === 0) {
      return NextResponse.json(
        { error: 'No valid words provided' }, 
        { status: 400 }
      );
    }

    console.log(`Adding ${wordsToAdd.length} word(s): ${wordsToAdd.join(', ')} from source: ${source || 'manual'}`);

    const results = [];
    const errors = [];

    // Process each word
    for (const wordText of wordsToAdd) {
      try {
        // Check if word already exists
        const existingWord = await vocabularyManager.getWordByText(wordText);
        if (existingWord) {
          const completeData = await vocabularyManager.getCompleteWordData(existingWord.id);
          results.push({ 
            word: wordText, 
            status: 'exists', 
            data: completeData 
          });
          continue;
        }

        // Add word from API
        const wordEntry = await vocabularyManager.addWordFromAPI(wordText);
        const completeData = await vocabularyManager.getCompleteWordData(wordEntry.id);
        
        results.push({ 
          word: wordText, 
          status: 'added', 
          data: completeData 
        });

      } catch (error) {
        console.error(`Error adding word "${wordText}":`, error);
        errors.push({ 
          word: wordText, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // Return results
    const response = {
      message: `Processed ${wordsToAdd.length} word(s)`,
      results: results || [],
      errors: errors || []
    };

    const statusCode = errors.length === 0 ? 201 : (results.length > 0 ? 207 : 500); // 207 = Multi-Status

    console.log('API outgoing response:', response);
    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    console.error('Error in POST /api/word-maze/words:', error);
    return NextResponse.json(
      { error: 'Failed to add word(s)' }, 
      { status: 500 }
    );
  }
}

// ========================================
// PUT - UPDATE WORD
// ========================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { wordId, updates } = body;

    if (!wordId || !updates) {
      return NextResponse.json(
        { error: 'Word ID and updates are required' }, 
        { status: 400 }
      );
    }

    const updatedWord = await vocabularyManager.updateWordEntry(wordId, updates);
    const completeData = await vocabularyManager.getCompleteWordData(wordId);

    return NextResponse.json({ 
      message: 'Word updated successfully', 
      word: completeData 
    });

  } catch (error) {
    console.error('Error in PUT /api/word-maze/words:', error);
    return NextResponse.json(
      { error: 'Failed to update word' }, 
      { status: 500 }
    );
  }
}

// ========================================
// DELETE - DELETE WORD
// ========================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wordId = searchParams.get('id');

    if (!wordId) {
      return NextResponse.json(
        { error: 'Word ID is required' }, 
        { status: 400 }
      );
    }

    // Delete word entry (cascades to related tables)
    const { error } = await supabase
      .from('word_entries')
      .delete()
      .eq('id', wordId);

    if (error) {
      console.error('Error deleting word:', error);
      return NextResponse.json(
        { error: 'Failed to delete word' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Word deleted successfully' 
    });

  } catch (error) {
    console.error('Error in DELETE /api/word-maze/words:', error);
    return NextResponse.json(
      { error: 'Failed to delete word' }, 
      { status: 500 }
    );
  }
} 