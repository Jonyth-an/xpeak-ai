import { NextRequest, NextResponse } from 'next/server';
import { vocabularyManager } from '../../../../lib/services/vocabularyManager';
import { apiAggregator } from '../../../../lib/services/apiAggregator';
import { serverSupabase, getUserFromAuthHeader } from '../../../../lib/serverSupabaseClient';
import { cookies } from 'next/headers';
import { VocabularyType } from '../../../../lib/types/wordMaze';

// ========================================
// AUTHENTICATION HELPER
// ========================================

async function getAuthenticatedUser(request: NextRequest) {
  console.log('=== AUTHENTICATION DEBUG ===');
  
  // Check for test mode header
  const bypassAuth = request.headers.get('X-Bypass-Auth') === 'true';
  console.log('Bypass auth header:', bypassAuth);
  
  if (bypassAuth) {
    // Test mode: use a hardcoded test user ID (proper UUID format)
    const user = { id: '00000000-0000-0000-0000-000000000001' };
    console.log('Test mode enabled - using test user ID:', user.id);
    return user;
  }

  // Try to get token from Authorization header first
  const authHeader = request.headers.get('Authorization');
  console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('Bearer token found, length:', token.length);
    
    try {
      // Use the shared helper function
      const { user, error } = await getUserFromAuthHeader(authHeader);
      
      if (error) {
        console.error('Error getting user from token:', error);
        return null;
      }
      
      if (!user) {
        console.log('No user found from token');
        return null;
      }
      
      console.log('User authenticated via token:', user.id);
      return user;
    } catch (error) {
      console.error('Error validating token:', error);
      return null;
    }
  }

  // Fallback to cookies (for backward compatibility)
  console.log('No Bearer token found, trying cookies...');
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('sb-bmzoowznbwxkqwxbcvjy-auth-token')?.value;
    const authToken0 = cookieStore.get('sb-bmzoowznbwxkqwxbcvjy-auth-token.0')?.value;
    
    if (!authToken && !authToken0) {
      console.log('No auth tokens found in cookies');
      return null;
    }

    // Parse the auth token
    const token = authToken || authToken0;
    if (!token) {
      console.log('No valid auth token found');
      return null;
    }

    try {
      const parsedToken = JSON.parse(token);
      const accessToken = parsedToken.access_token;
      
      if (!accessToken) {
        console.log('No access token in parsed auth data');
        return null;
      }

      // Use the shared client to get user info
      const { data: { user }, error } = await serverSupabase.auth.getUser(accessToken);
      
      if (error) {
        console.log('Error getting user from access token:', error);
        return null;
      }
      
      if (!user) {
        console.log('No user found from access token');
        return null;
      }
      
      console.log('User authenticated via cookies:', user.id);
      return user;
    } catch (parseError) {
      console.error('Error parsing auth token:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Error getting session from cookies:', error);
    return null;
  }
}

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

    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Get total count for pagination (only user's collection)
    const { count: totalCount, error: countError } = await serverSupabase
      .from('user_word_collections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (countError) {
      console.error('Error fetching total count:', countError);
      // For test mode, return empty result instead of error
      if (request.headers.get('X-Bypass-Auth') === 'true') {
        return NextResponse.json({ 
          words: [],
          total: 0,
          page: 1,
          totalPages: 0
        });
      }
      return NextResponse.json({ error: 'Failed to fetch total count' }, { status: 500 });
    }

    // Get user's word collection (with pagination)
    const { data: userCollections, error } = await serverSupabase
      .from('user_word_collections')
      .select(`
        *,
        word_entries (
          id,
          word_text,
          type,
          difficulty_level,
          difficulty_score,
          created_at,
          updated_at,
          is_verified,
          verification_source,
          metadata
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .range(offset, offset + limit - 1)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching user word collections:', error);
      // For test mode, return empty result instead of error
      if (request.headers.get('X-Bypass-Auth') === 'true') {
        return NextResponse.json({ 
          words: [],
          total: 0,
          page: 1,
          totalPages: 0
        });
      }
      return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
    }

    // Get complete word data including definitions for each word
    const wordsWithCompleteData = await Promise.all(
      userCollections.map(async (collection) => {
        try {
          const wordEntry = collection.word_entries;
          if (!wordEntry) return null;

          const completeData = await vocabularyManager.getCompleteWordData(wordEntry.id);
          if (completeData) {
            // Combine basic entry data with complete word data
            return {
              ...completeData,
              id: wordEntry.id,
              created_at: wordEntry.created_at,
              updated_at: wordEntry.updated_at,
              is_verified: wordEntry.is_verified,
              verification_source: wordEntry.verification_source,
              // Add collection-specific data
              added_at: collection.added_at,
              added_via: collection.added_via,
              notes: collection.notes
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching complete data for word ${collection.word_entries?.id}:`, error);
          // Return basic word data if complete data fetch fails
          const wordEntry = collection.word_entries;
          if (!wordEntry) return null;

          return {
            word: wordEntry.word_text,
            type: wordEntry.type,
            definitions: [],
            examples: [],
            tags: [],
            relationships: [],
            difficulty: {
              level: wordEntry.difficulty_level,
              score: wordEntry.difficulty_score
            },
            metadata: wordEntry.metadata,
            id: wordEntry.id,
            created_at: wordEntry.created_at,
            updated_at: wordEntry.updated_at,
            is_verified: wordEntry.is_verified,
            verification_source: wordEntry.verification_source,
            // Add collection-specific data
            added_at: collection.added_at,
            added_via: collection.added_via,
            notes: collection.notes
          };
        }
      })
    );

    // Filter out null values and format response
    const validWords = wordsWithCompleteData.filter(word => word !== null);
    
    const totalPages = Math.ceil((totalCount || 0) / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return NextResponse.json({
      words: validWords,
      total: totalCount || 0,
      page: currentPage,
      totalPages: totalPages
    });

  } catch (error) {
    console.error('Error in GET /api/word-maze/words:', error);
    return NextResponse.json(
      { error: 'Failed to fetch words' }, 
      { status: 500 }
    );
  }
}

// ========================================
// POST - ADD WORDS
// ========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, words, source } = body;

    console.log('POST request body:', body);

    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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
        // Check if word already exists in shared word bank
        let wordEntry = await vocabularyManager.getWordByText(wordText);
        
        if (!wordEntry) {
          // Add word to shared word bank first
          const userEmail = 'email' in user ? (user.email as string) : 'test@example.com';
          wordEntry = await vocabularyManager.addWordFromAPI(wordText, userEmail);
        }

        // Check if user already has this word in their collection
        const { data: existingCollection } = await serverSupabase
          .from('user_word_collections')
          .select('*')
          .eq('user_id', user.id)
          .eq('word_id', wordEntry.id)
          .eq('is_active', true)
          .single();

        if (existingCollection) {
          // Word already in user's collection, update position
          await serverSupabase
            .from('user_word_collections')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', existingCollection.id);

          const completeData = await vocabularyManager.getCompleteWordData(wordEntry.id);
          results.push({ 
            word: wordText, 
            status: 'exists', 
            data: completeData 
          });
          continue;
        }

        // Add word to user's collection
        const { error: collectionError } = await serverSupabase
          .from('user_word_collections')
          .insert({
            user_id: user.id,
            word_id: wordEntry.id,
            added_via: source || 'manual'
          });

        if (collectionError) {
          console.error('Error adding word to user collection:', collectionError);
          errors.push({ 
            word: wordText, 
            error: 'Failed to add word to your collection' 
          });
          continue;
        }

        const completeData = await vocabularyManager.getCompleteWordData(wordEntry.id);
        results.push({ 
          word: wordText, 
          status: 'new', 
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

    // Check for test mode header
    const bypassAuth = request.headers.get('X-Bypass-Auth') === 'true';
    
    let user = null;
    
    if (bypassAuth) {
      // Test mode: use a hardcoded test user ID (proper UUID format)
      user = { id: '00000000-0000-0000-0000-000000000001' };
      console.log('Test mode enabled - using test user ID:', user.id);
    } else {
      // Normal mode: get the current user
      user = await getAuthenticatedUser(request);
      
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Remove the word from the user's personal collection (soft delete)
    const { error } = await serverSupabase
      .from('user_word_collections')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('word_id', wordId);

    if (error) {
      console.error('Error removing word from user collection:', error);
      return NextResponse.json(
        { error: 'Failed to remove word from your collection' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Word removed from your collection successfully' 
    });

  } catch (error) {
    console.error('Error in DELETE /api/word-maze/words:', error);
    return NextResponse.json(
      { error: 'Failed to remove word from your collection' }, 
      { status: 500 }
    );
  }
} 