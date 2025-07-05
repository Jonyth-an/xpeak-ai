#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runNewsletterMigration() {
  console.log('🚀 Running newsletter subscription migration...\n');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../database/migrations/create_newsletter_subscriptions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL loaded successfully');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ Statement ${i + 1} failed:`, error);
          console.error('SQL:', statement);
          process.exit(1);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('\n🎉 Newsletter migration completed successfully!');
    
    // Test the table
    console.log('\n🧪 Testing the new table...');
    const { data, error: testError } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Table test failed:', testError);
    } else {
      console.log('✅ Newsletter subscriptions table is accessible and working correctly');
    }
    
    // Test the analytics view
    console.log('\n📊 Testing analytics view...');
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('newsletter_analytics')
      .select('*')
      .limit(1);
    
    if (analyticsError) {
      console.error('❌ Analytics view test failed:', analyticsError);
    } else {
      console.log('✅ Newsletter analytics view is working correctly');
      console.log('📈 Current analytics:', analyticsData[0]);
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

runNewsletterMigration(); 