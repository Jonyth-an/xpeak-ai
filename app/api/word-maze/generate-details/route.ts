import { NextRequest, NextResponse } from 'next/server';
import { vocabularyManager } from '../../../../lib/services/vocabularyManager';
import OpenAI from 'openai';
import { supabase } from '../../../../lib/supabaseClient';

// We'll instantiate OpenAI client as needed below

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { word, prompt } = await request.json();

    if (!word) {
      return NextResponse.json(
        { error: 'Word is required' },
        { status: 400 }
      );
    }

    console.log(`Generating AI content for word: ${word}`);

    const systemPrompt = `You are a helpful language learning assistant. Generate comprehensive, accurate, and educational content for vocabulary words. Always respond with valid JSON that matches the requested structure exactly.`;

    const userPrompt = prompt || `Generate comprehensive information for the word "${word}". Return a JSON object with the following structure:

{
  "definitions": [
    {
      "text": "Clear, concise definition",
      "source": "ai",
      "confidence": 0.9
    }
  ],
  "examples": [
    {
      "text": "Example sentence using the word",
      "source": "ai",
      "context": "formal"
    }
  ],
  "synonyms": ["synonym1", "synonym2", "synonym3"],
  "usage_tip": "Helpful tip for using this word correctly",
  "difficulty_level": "beginner|intermediate|advanced",
  "difficulty_score": 0.0-1.0,
  "tags": [
    {
      "type": "part_of_speech",
      "value": "noun|verb|adjective|adverb",
      "confidence": 0.9,
      "source": "ai"
    },
    {
      "type": "formality",
      "value": "formal|informal|casual",
      "confidence": 0.8,
      "source": "ai"
    }
  ]
}

Make the content educational, accurate, and suitable for language learners. Keep definitions clear and examples practical.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', responseText);
      // Return fallback data if JSON parsing fails
      parsedResponse = {
        definitions: [{
          text: `A word or term: ${word}`,
          source: 'ai',
          confidence: 0.5
        }],
        examples: [],
        synonyms: [],
        usage_tip: '',
        difficulty_level: 'intermediate',
        difficulty_score: 0.5,
        tags: [{
          type: 'part_of_speech',
          value: 'unknown',
          confidence: 0.5,
          source: 'ai'
        }]
      };
    }

    console.log(`Successfully generated content for word: ${word}`);

    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('Error generating word details:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate word details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 