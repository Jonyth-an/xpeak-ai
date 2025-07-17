const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Configuration
const OLD_PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const OLD_PROJECT_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const OLD_PROJECT_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 Supabase Project Migration Tool\n');
console.log('This script will help you migrate all data from your current project to a new one.\n');

// Check if we have the required environment variables
if (!OLD_PROJECT_URL || !OLD_PROJECT_ANON_KEY) {
  console.error('❌ Missing current project environment variables');
  console.log('Please ensure you have in .env.local:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-old-project.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_old_anon_key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_old_service_role_key');
  process.exit(1);
}

console.log('✅ Current project configuration found');
console.log('Old Project URL:', OLD_PROJECT_URL);

// Create old project client with service role for full access
const oldSupabase = createClient(OLD_PROJECT_URL, OLD_PROJECT_SERVICE_ROLE_KEY || OLD_PROJECT_ANON_KEY);

async function migrateProject() {
  console.log('\n📋 Migration Plan:');
  console.log('1. Export all database tables');
  console.log('2. Export all users and auth data');
  console.log('3. Export storage files (if any)');
  console.log('4. Generate new project setup instructions');
  console.log('5. Create import scripts for the new project\n');

  try {
    // Step 1: Export database tables
    console.log('📊 Step 1: Exporting database tables...');
    const tables = await exportAllTables();
    
    // Step 2: Export users
    console.log('\n👥 Step 2: Exporting users...');
    const users = await exportUsers();
    
    // Step 3: Export storage
    console.log('\n📁 Step 3: Exporting storage files...');
    const storageFiles = await exportStorage();
    
    // Step 4: Generate migration files
    console.log('\n📝 Step 4: Generating migration files...');
    await generateMigrationFiles(tables, users, storageFiles);
    
    console.log('\n✅ Migration preparation complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Create a new Supabase project');
    console.log('2. Run the generated migration scripts');
    console.log('3. Update your environment variables');
    console.log('4. Test the new project');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function exportAllTables() {
  const tables = [];
  
  // List of tables to export (add more as needed)
  const tableNames = [
    'profiles',
    'tutors',
    'lessons',
    'bookings',
    'tutor_applications',
    'reschedule_requests',
    'word_maze_words',
    'word_maze_paths',
    'user_collections',
    'billing_subscriptions',
    'billing_invoices',
    'admin_audit_trail'
  ];
  
  for (const tableName of tableNames) {
    try {
      console.log(`  Exporting ${tableName}...`);
      const { data, error } = await oldSupabase
        .from(tableName)
        .select('*');
      
      if (error) {
        console.log(`    ⚠️  Table ${tableName} not found or empty:`, error.message);
        tables.push({ name: tableName, data: [] });
      } else {
        console.log(`    ✅ Exported ${data.length} rows from ${tableName}`);
        tables.push({ name: tableName, data: data || [] });
      }
    } catch (error) {
      console.log(`    ⚠️  Error exporting ${tableName}:`, error.message);
      tables.push({ name: tableName, data: [] });
    }
  }
  
  return tables;
}

async function exportUsers() {
  console.log('  Exporting users...');
  
  try {
    // Get all users (requires service role key)
    const { data: users, error } = await oldSupabase.auth.admin.listUsers();
    
    if (error) {
      console.log('    ⚠️  Could not export users:', error.message);
      return [];
    }
    
    console.log(`    ✅ Exported ${users.users.length} users`);
    return users.users;
  } catch (error) {
    console.log('    ⚠️  Error exporting users:', error.message);
    return [];
  }
}

async function exportStorage() {
  console.log('  Exporting storage files...');
  
  try {
    // List all buckets
    const { data: buckets, error: bucketsError } = await oldSupabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('    ⚠️  Could not list storage buckets:', bucketsError.message);
      return [];
    }
    
    const storageFiles = [];
    
    for (const bucket of buckets) {
      try {
        const { data: files, error: filesError } = await oldSupabase.storage
          .from(bucket.name)
          .list();
        
        if (filesError) {
          console.log(`    ⚠️  Could not list files in bucket ${bucket.name}:`, filesError.message);
          continue;
        }
        
        console.log(`    ✅ Found ${files.length} files in bucket ${bucket.name}`);
        storageFiles.push({
          bucket: bucket.name,
          files: files
        });
      } catch (error) {
        console.log(`    ⚠️  Error listing files in bucket ${bucket.name}:`, error.message);
      }
    }
    
    return storageFiles;
  } catch (error) {
    console.log('    ⚠️  Error exporting storage:', error.message);
    return [];
  }
}

async function generateMigrationFiles(tables, users, storageFiles) {
  const migrationDir = 'migration-export';
  
  // Create migration directory
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir);
  }
  
  // Generate data export files
  console.log('  Generating data export files...');
  
  // Export tables
  const tablesData = {};
  tables.forEach(table => {
    tablesData[table.name] = table.data;
  });
  
  fs.writeFileSync(
    path.join(migrationDir, 'tables-export.json'),
    JSON.stringify(tablesData, null, 2)
  );
  
  // Export users
  fs.writeFileSync(
    path.join(migrationDir, 'users-export.json'),
    JSON.stringify(users, null, 2)
  );
  
  // Export storage info
  fs.writeFileSync(
    path.join(migrationDir, 'storage-export.json'),
    JSON.stringify(storageFiles, null, 2)
  );
  
  // Generate import script
  console.log('  Generating import script...');
  const importScript = generateImportScript(tables, users, storageFiles);
  fs.writeFileSync(path.join(migrationDir, 'import-to-new-project.js'), importScript);
  
  // Generate setup instructions
  console.log('  Generating setup instructions...');
  const setupInstructions = generateSetupInstructions();
  fs.writeFileSync(path.join(migrationDir, 'SETUP_INSTRUCTIONS.md'), setupInstructions);
  
  console.log(`  ✅ Migration files created in ./${migrationDir}/`);
}

function generateImportScript(tables, users, storageFiles) {
  return `const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// IMPORTANT: Update these with your NEW project credentials
const NEW_PROJECT_URL = 'https://your-new-project.supabase.co';
const NEW_PROJECT_SERVICE_ROLE_KEY = 'your_new_service_role_key';

console.log('🚀 Importing data to new Supabase project...\\n');

const newSupabase = createClient(NEW_PROJECT_URL, NEW_PROJECT_SERVICE_ROLE_KEY);

async function importData() {
  try {
    // Import tables
    console.log('📊 Importing tables...');
    ${tables.map(table => `
    // Import ${table.name}
    console.log('  Importing ${table.name}...');
    if (${table.name}Data.length > 0) {
      const { error } = await newSupabase
        .from('${table.name}')
        .insert(${table.name}Data);
      if (error) {
        console.error('    ❌ Error importing ${table.name}:', error.message);
      } else {
        console.log('    ✅ Imported ${table.name}');
      }
    }`).join('')}
    
    // Import users
    console.log('\\n👥 Importing users...');
    for (const user of usersData) {
      try {
        const { error } = await newSupabase.auth.admin.createUser({
          email: user.email,
          password: 'temporary-password-' + Math.random().toString(36).substring(7),
          email_confirm: true,
          user_metadata: user.user_metadata,
          app_metadata: user.app_metadata
        });
        if (error) {
          console.error('    ❌ Error importing user', user.email, ':', error.message);
        } else {
          console.log('    ✅ Imported user:', user.email);
        }
      } catch (error) {
        console.error('    ❌ Error importing user', user.email, ':', error.message);
      }
    }
    
    console.log('\\n✅ Import completed!');
    console.log('\\n⚠️  IMPORTANT:');
    console.log('- Users were created with temporary passwords');
    console.log('- They will need to reset their passwords');
    console.log('- Check the imported data for any issues');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

// Load exported data
const tablesData = JSON.parse(fs.readFileSync('./tables-export.json', 'utf8'));
const usersData = JSON.parse(fs.readFileSync('./users-export.json', 'utf8'));

// Extract table data
${tables.map(table => `const ${table.name}Data = tablesData['${table.name}'] || [];`).join('\n')}

importData();
`;
}

function generateSetupInstructions() {
  return `# Supabase Project Migration Setup Instructions

## Step 1: Create New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: "XPeak AI (New)"
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
5. Click "Create new project"
6. Wait for project to be ready (2-3 minutes)

## Step 2: Get New Project Credentials

1. In your new project dashboard, go to Settings > API
2. Copy the following:
   - Project URL
   - Anon public key
   - Service role key (keep this secret!)

## Step 3: Set Up Database Schema

1. Go to SQL Editor in your new project
2. Run all your existing migrations from the \`database/migrations/\` folder
3. Or import your schema from the old project

## Step 4: Configure OAuth Providers

1. Go to Authentication > Providers
2. Set up Google OAuth:
   - Enable Google
   - Add your Google Client ID and Secret
   - Add redirect URI: https://your-new-project.supabase.co/auth/v1/callback
3. Set up Facebook OAuth (if needed):
   - Enable Facebook
   - Add your Facebook App ID and Secret
   - Add redirect URI: https://your-new-project.supabase.co/auth/v1/callback

## Step 5: Import Data

1. Update the credentials in \`import-to-new-project.js\`
2. Run the import script:
   \`\`\`bash
   node import-to-new-project.js
   \`\`\`

## Step 6: Update Environment Variables

Update your \`.env.local\` file:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
\`\`\`

## Step 7: Test the New Project

1. Start your development server
2. Test login/signup flows
3. Test all major features
4. Verify data was imported correctly

## Step 8: Update OAuth Redirect URIs

1. In Google Cloud Console, update redirect URIs to point to your new project
2. In Facebook Developers, update redirect URIs to point to your new project

## Step 9: Deploy and Switch

1. Deploy your app with the new environment variables
2. Test in production
3. Once confirmed working, you can delete the old project

## Troubleshooting

- If users can't log in, they may need to reset passwords
- Check the import logs for any errors
- Verify all OAuth providers are configured correctly
- Test the auth callback flow thoroughly
`;
}

// Run migration
migrateProject(); 