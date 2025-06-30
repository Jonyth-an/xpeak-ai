import { NextRequest, NextResponse } from 'next/server';
import { vocabularyManager } from '../../../../lib/services/vocabularyManager';
import OpenAI from 'openai';
import { supabase } from '../../../../lib/supabaseClient';

// We'll instantiate OpenAI client as needed below

export async function POST(request: NextRequest) {
  try {
    const { word, openaiApiKey } = await request.json();
    if (!word) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    // Step 1: Check cache first
    const { data: cachedData, error: cacheError } = await supabase
      .from('word_details_cache')
      .select('definition, example, synonyms, usage_tip')
      .eq('word', word.toLowerCase())
      .single();

    if (cachedData && !cacheError) {
      console.log(`Cache hit for word: ${word}`);
      return NextResponse.json({
        definition: cachedData.definition || '',
        example: cachedData.example || '',
        synonyms: cachedData.synonyms || [],
        usageTip: cachedData.usage_tip || '',
        cached: true
      });
    }

    console.log(`Cache miss for word: ${word}, generating details...`);

    // Step 2: Get word entry and complete data
    const wordEntry = await vocabularyManager.getWordByText(word);
    if (!wordEntry) {
      return NextResponse.json({ error: 'Word not found in vocabulary' }, { status: 404 });
    }

    const completeData = await vocabularyManager.getCompleteWordData(wordEntry.id);
    let definition = '';
    let example = '';
    let synonyms: string[] = [];
    
    if (completeData) {
      if (completeData.definitions && completeData.definitions.length > 0) {
        definition = completeData.definitions[0].text;
      }
      if (completeData.examples && completeData.examples.length > 0) {
        example = completeData.examples[0].text;
      }
      if (completeData.relationships) {
        synonyms = completeData.relationships
          .filter(r => r.type === 'synonym')
          .map(r => r.related_word)
          .filter(Boolean);
      }
    }

    // Step 3: Generate missing content with OpenAI
    let usageTip = '';
    const apiKey = openaiApiKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key is required' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });

    // Generate usage tip if missing
    if (!usageTip) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful language learning assistant. Provide concise, practical usage tips for English words. Keep tips under 100 words and focus on practical advice.'
            },
            {
              role: 'user',
              content: `Provide a brief usage tip for the word "${word}". Include context about when and how to use it appropriately.`
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        });

        usageTip = completion.choices[0]?.message?.content?.trim() || '';
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        usageTip = 'Usage tip not available at this time.';
      }
    }

    // Generate missing definition if needed
    if (!definition) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful language learning assistant. Provide clear, concise definitions for English words.'
            },
            {
              role: 'user',
              content: `Provide a clear definition for the word "${word}".`
            }
          ],
          max_tokens: 100,
          temperature: 0.3
        });

        definition = completion.choices[0]?.message?.content?.trim() || '';
      } catch (openaiError) {
        console.error('OpenAI API error for definition:', openaiError);
        definition = 'Definition not available at this time.';
      }
    }

    // Generate missing example if needed
    if (!example) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful language learning assistant. Provide natural example sentences for English words.'
            },
            {
              role: 'user',
              content: `Provide a natural example sentence using the word "${word}".`
            }
          ],
          max_tokens: 100,
          temperature: 0.7
        });

        example = completion.choices[0]?.message?.content?.trim() || '';
      } catch (openaiError) {
        console.error('OpenAI API error for example:', openaiError);
        example = 'Example not available at this time.';
      }
    }

    // Generate missing synonyms if needed
    if (synonyms.length === 0) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful language learning assistant. Provide 3-5 synonyms for English words. Return only the synonyms separated by commas, no explanations.'
            },
            {
              role: 'user',
              content: `Provide 3-5 synonyms for the word "${word}". Return only the synonyms separated by commas.`
            }
          ],
          max_tokens: 50,
          temperature: 0.3
        });

        const synonymsText = completion.choices[0]?.message?.content?.trim() || '';
        synonyms = synonymsText.split(',').map(s => s.trim()).filter(Boolean);
      } catch (openaiError) {
        console.error('OpenAI API error for synonyms:', openaiError);
        synonyms = [];
      }
    }

    // Step 4: Store in cache
    try {
      const { error: insertError } = await supabase
        .from('word_details_cache')
        .insert({
          word: word.toLowerCase(),
          definition,
          example,
          synonyms,
          usage_tip: usageTip
        });

      if (insertError) {
        console.error('Error inserting into cache:', insertError);
        // Continue even if cache insert fails
      } else {
        console.log(`Cached details for word: ${word}`);
      }
    } catch (cacheInsertError) {
      console.error('Cache insert error:', cacheInsertError);
      // Continue even if cache insert fails
    }

    return NextResponse.json({
      definition,
      example,
      synonyms,
      usageTip,
      cached: false
    });

  } catch (error) {
    console.error('Error in generate-details:', error);
    return NextResponse.json(
      { error: 'Failed to generate word details' },
      { status: 500 }
    );
  }
} 