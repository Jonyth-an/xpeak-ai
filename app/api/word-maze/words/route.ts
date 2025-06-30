import { NextRequest, NextResponse } from 'next/server';
import { vocabularyManager } from '../../../../lib/services/vocabularyManager';
import { apiAggregator } from '../../../../lib/services/apiAggregator';
import { createClient } from '@supabase/supabase-js';

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
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');

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
    if (type) {
      const words = await vocabularyManager.getWordsByType(type, limit);
      return NextResponse.json({ words });
    }

    // Get all words (with pagination)
    const { data: words, error } = await supabase
      .from('word_entries')
      .select('*')
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching words:', error);
      return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
    }

    return NextResponse.json({ words });

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
    const { word, source } = body;

    if (!word) {
      return NextResponse.json(
        { error: 'Word is required' }, 
        { status: 400 }
      );
    }

    console.log(`Adding word: ${word} from source: ${source || 'manual'}`);

    // Check if word already exists
    const existingWord = await vocabularyManager.getWordByText(word);
    if (existingWord) {
      const completeData = await vocabularyManager.getCompleteWordData(existingWord.id);
      return NextResponse.json({ 
        message: 'Word already exists', 
        word: completeData 
      });
    }

    // Add word from API
    const wordEntry = await vocabularyManager.addWordFromAPI(word);
    const completeData = await vocabularyManager.getCompleteWordData(wordEntry.id);

    return NextResponse.json({ 
      message: 'Word added successfully', 
      word: completeData 
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/word-maze/words:', error);
    return NextResponse.json(
      { error: 'Failed to add word' }, 
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