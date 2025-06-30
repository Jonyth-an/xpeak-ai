#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// ========================================
// CONFIGURATION
// ========================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ========================================
// SETUP FUNCTIONS
// ========================================

async function checkTables() {
  console.log('🔍 Checking if tables exist...');
  
  const tables = [
    'word_entries',
    'word_definitions', 
    'word_examples',
    'word_tags',
    'word_relationships',
    'user_word_mastery',
    'user_learning_sessions',
    'maze_paths',
    'maze_nodes',
    'user_maze_progress',
    'challenge_templates',
    'user_challenge_attempts',
    'api_cache'
  ];
  
  let allTablesExist = true;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`✅ Table ${table}: OK`);
      }
    } catch (error) {
      console.log(`❌ Table ${table}: ${error.message}`);
      allTablesExist = false;
    }
  }
  
  return allTablesExist;
}

async function addSampleWords() {
  console.log('📝 Adding sample words...');
  
  const sampleWords = [
    {
      word_text: 'serendipity',
      type: 'word',
      difficulty_level: 'C1',
      difficulty_score: 8.5,
      definition: 'The occurrence and development of events by chance in a happy or beneficial way',
      example: 'Finding that perfect job was pure serendipity.'
    },
    {
      word_text: 'ephemeral',
      type: 'word',
      difficulty_level: 'B2',
      difficulty_score: 7.0,
      definition: 'Lasting for a very short time; transitory',
      example: 'The beauty of cherry blossoms is ephemeral.'
    },
    {
      word_text: 'mellifluous',
      type: 'word',
      difficulty_level: 'C1',
      difficulty_score: 8.0,
      definition: 'Sweet or musical; pleasant to hear',
      example: 'She has a mellifluous voice that captivates audiences.'
    },
    {
      word_text: 'ubiquitous',
      type: 'word',
      difficulty_level: 'B2',
      difficulty_score: 7.5,
      definition: 'Present, appearing, or found everywhere',
      example: 'Smartphones have become ubiquitous in modern society.'
    },
    {
      word_text: 'spill the tea',
      type: 'phrase',
      difficulty_level: 'B1',
      difficulty_score: 5.0,
      definition: 'To share gossip or reveal secrets',
      example: 'Come on, spill the tea about what happened at the party!'
    },
    {
      word_text: 'based',
      type: 'word',
      difficulty_level: 'A2',
      difficulty_score: 3.0,
      definition: 'Having a strong foundation; authentic or genuine',
      example: 'That take is so based.'
    },
    {
      word_text: 'rizz',
      type: 'word',
      difficulty_level: 'A2',
      difficulty_score: 2.5,
      definition: 'Charisma, charm, or the ability to attract romantic partners',
      example: 'He has serious rizz with the ladies.'
    }
  ];
  
  let addedCount = 0;
  
  for (const wordData of sampleWords) {
    try {
      console.log(`Adding word: ${wordData.word_text}`);
      
      // Insert the word entry
      const { data: wordEntry, error: wordError } = await supabase
        .from('word_entries')
        .insert({
          word_text: wordData.word_text,
          type: wordData.type,
          difficulty_level: wordData.difficulty_level,
          difficulty_score: wordData.difficulty_score,
          is_verified: true,
          verification_source: 'manual',
          metadata: {}
        })
        .select()
        .single();
      
      if (wordError) {
        if (wordError.code === '23505') { // Unique constraint violation
          console.log(`⚠️  Word ${wordData.word_text} already exists, skipping...`);
          continue;
        } else {
          console.log(`⚠️  Could not add ${wordData.word_text}: ${wordError.message}`);
          continue;
        }
      }
      
      // Add definition
      if (wordData.definition) {
        const { error: defError } = await supabase
          .from('word_definitions')
          .insert({
            word_id: wordEntry.id,
            source_api: 'manual',
            definition_text: wordData.definition,
            part_of_speech: 'noun',
            is_primary: true,
            confidence_score: 1.0
          });
        
        if (defError) {
          console.log(`⚠️  Could not add definition for ${wordData.word_text}: ${defError.message}`);
        }
      }
      
      // Add example
      if (wordData.example) {
        const { error: exError } = await supabase
          .from('word_examples')
          .insert({
            word_id: wordEntry.id,
            source_api: 'manual',
            example_text: wordData.example,
            context: 'casual',
            is_primary: true
          });
        
        if (exError) {
          console.log(`⚠️  Could not add example for ${wordData.word_text}: ${exError.message}`);
        }
      }
      
      console.log(`✅ Added ${wordData.word_text}`);
      addedCount++;
      
    } catch (error) {
      console.log(`⚠️  Error adding ${wordData.word_text}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Added ${addedCount} new words to the database`);
}

async function createSampleMazePath() {
  console.log('🎯 Creating sample maze path...');
  
  try {
    // Create a sample maze path
    const { data: pathData, error: pathError } = await supabase
      .from('maze_paths')
      .insert({
        name: 'Advanced Vocabulary Journey',
        description: 'A challenging path through sophisticated English words',
        path_type: 'difficulty',
        difficulty_level: 'C1',
        estimated_duration: 30,
        is_active: true,
        metadata: {
          theme: 'advanced_vocabulary',
          tags: ['sophisticated', 'academic', 'challenging']
        }
      })
      .select()
      .single();
    
    if (pathError) {
      if (pathError.code === '23505') {
        console.log('⚠️  Sample maze path already exists, skipping...');
        return;
      } else {
        console.log(`⚠️  Could not create maze path: ${pathError.message}`);
        return;
      }
    }
    
    // Get some words to add to the path
    const { data: words } = await supabase
      .from('word_entries')
      .select('id, word_text')
      .limit(5);
    
    if (words && words.length > 0) {
      for (let i = 0; i < words.length; i++) {
        const { error: nodeError } = await supabase
          .from('maze_nodes')
          .insert({
            path_id: pathData.id,
            word_id: words[i].id,
            position: i + 1,
            challenge_type: 'definition',
            unlock_condition: {}
          });
        
        if (nodeError) {
          console.log(`⚠️  Could not add word ${words[i].word_text} to path: ${nodeError.message}`);
        }
      }
      
      console.log(`✅ Created maze path with ${words.length} words`);
    }
    
  } catch (error) {
    console.log(`⚠️  Error creating maze path: ${error.message}`);
  }
}

// ========================================
// MAIN EXECUTION
// ========================================

async function main() {
  console.log('🚀 Setting up Word Maze system...\n');
  
  try {
    // Check if we can connect to Supabase
    console.log('🔌 Testing Supabase connection...');
    const { data, error } = await supabase.from('word_entries').select('count').limit(1);
    
    if (error) {
      console.error('❌ Cannot connect to Supabase:', error.message);
      console.error('Please check your environment variables and database connection');
      process.exit(1);
    }
    
    console.log('✅ Supabase connection successful!\n');
    
    // Check tables
    const tablesExist = await checkTables();
    console.log('');
    
    if (!tablesExist) {
      console.error('❌ Some tables are missing. Please run the SQL migration first.');
      process.exit(1);
    }
    
    // Add sample words
    await addSampleWords();
    console.log('');
    
    // Create sample maze path
    await createSampleMazePath();
    console.log('');
    
    console.log('🎉 Word Maze setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Visit http://localhost:3000/word-maze-test to test the system');
    console.log('3. Add your API keys to .env.local for enhanced features:');
    console.log('   - OXFORD_APP_ID');
    console.log('   - OXFORD_APP_KEY');
    console.log('   - WORDNIK_API_KEY');
    console.log('   - TWINWORD_API_KEY');
    console.log('4. Start building the maze engine!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
main(); 