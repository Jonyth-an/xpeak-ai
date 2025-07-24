const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🔄 Running migration to prevent duplicate conversations...')
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../database/migrations/prevent_duplicate_conversations.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration file loaded, executing...')
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      return
    }
    
    console.log('✅ Migration completed successfully!')
    
    // Verify the migration worked by checking if the unique index exists
    console.log('🔍 Verifying migration...')
    
    const { data: conversations, error: verifyError } = await supabase
      .from('conversations')
      .select('id, student_tutor_pair_key')
      .eq('conversation_type', 'student_tutor')
      .limit(5)
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError)
      return
    }
    
    console.log('✅ Migration verification successful!')
    console.log('📊 Sample conversations with pair keys:', conversations?.length || 0)
    
  } catch (error) {
    console.error('💥 Error running migration:', error)
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('🏁 Migration script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  }) 