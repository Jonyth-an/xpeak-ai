const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupDuplicateLessons() {
  console.log('🧹 Starting duplicate lessons cleanup...');
  
  try {
    // Get all lessons
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching lessons:', error);
      return;
    }
    
    console.log(`📊 Found ${lessons.length} total lessons`);
    
    // Group lessons by student_id, tutor_id, scheduled_start, and scheduled_end
    const groupedLessons = {};
    const duplicates = [];
    
    lessons.forEach(lesson => {
      const key = `${lesson.student_id}-${lesson.tutor_id}-${lesson.scheduled_start}-${lesson.scheduled_end}`;
      
      if (!groupedLessons[key]) {
        groupedLessons[key] = [];
      }
      
      groupedLessons[key].push(lesson);
      
      // If we have more than one lesson with the same key, mark as duplicate
      if (groupedLessons[key].length > 1) {
        duplicates.push(...groupedLessons[key].slice(1)); // Keep the first one, mark the rest as duplicates
      }
    });
    
    console.log(`🔍 Found ${duplicates.length} duplicate lessons`);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }
    
    // Delete duplicate lessons (keeping the oldest one)
    const duplicateIds = duplicates.map(lesson => lesson.id);
    
    console.log('🗑️ Deleting duplicate lessons:', duplicateIds);
    
    const { error: deleteError } = await supabase
      .from('lessons')
      .delete()
      .in('id', duplicateIds);
    
    if (deleteError) {
      console.error('Error deleting duplicates:', deleteError);
      return;
    }
    
    console.log(`✅ Successfully deleted ${duplicates.length} duplicate lessons`);
    
    // Verify cleanup
    const { data: remainingLessons, error: verifyError } = await supabase
      .from('lessons')
      .select('*');
    
    if (verifyError) {
      console.error('Error verifying cleanup:', verifyError);
      return;
    }
    
    console.log(`📊 Remaining lessons after cleanup: ${remainingLessons.length}`);
    
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

// Run the cleanup
cleanupDuplicateLessons(); 