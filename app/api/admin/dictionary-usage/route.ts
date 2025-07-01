import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/adminAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const adminUser = await requireAdminAuth(request);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const userEmail = searchParams.get('userEmail');

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get AI word generation usage from word_entries table
    let query = supabase
      .from('word_entries')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    // Add user filter if specified (this would need to be implemented based on your user tracking)
    // For now, we'll get all word entries and filter by metadata if available

    const { data: wordEntries, error } = await query;

    if (error) {
      console.error('Error fetching AI word generation usage:', error);
      return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 });
    }

    // Calculate statistics
    const stats = calculateAIUsageStats(wordEntries || []);
    
    // Get generation source breakdown
    const sourceBreakdown = calculateSourceBreakdown(wordEntries || []);
    
    // Get daily trends
    const dailyTrends = calculateDailyTrends(wordEntries || [], startDate, now);
    
    // Get word type breakdown
    const typeBreakdown = calculateTypeBreakdown(wordEntries || []);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        sourceBreakdown,
        dailyTrends,
        typeBreakdown,
        rawData: wordEntries || []
      }
    });

  } catch (error) {
    console.error('Error in AI word generation usage API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateAIUsageStats(data: any[]) {
  const totalWords = data.length;
  const aiGenerated = data.filter(entry => 
    entry.metadata?.generated_by === 'openai' || 
    entry.metadata?.generated_by === 'ai'
  ).length;
  const fallbackGenerated = data.filter(entry => 
    entry.metadata?.generated_by === 'fallback'
  ).length;
  const aiSuccessRate = totalWords > 0 ? (aiGenerated / totalWords) * 100 : 0;
  
  const uniqueWords = new Set(data.map(entry => entry.word_text)).size;
  const uniqueTypes = new Set(data.map(entry => entry.type)).size;

  return {
    totalWords,
    aiGenerated,
    fallbackGenerated,
    aiSuccessRate: Math.round(aiSuccessRate * 100) / 100,
    uniqueWords,
    uniqueTypes,
    averageWordsPerDay: totalWords > 0 ? Math.round((totalWords / 30) * 100) / 100 : 0
  };
}

function calculateSourceBreakdown(data: any[]) {
  const sourceStats: Record<string, { total: number; percentage: number }> = {};
  
  data.forEach(entry => {
    const source = entry.metadata?.generated_by || 'unknown';
    if (!sourceStats[source]) {
      sourceStats[source] = { total: 0, percentage: 0 };
    }
    sourceStats[source].total++;
  });

  // Calculate percentages
  const total = data.length;
  Object.keys(sourceStats).forEach(source => {
    sourceStats[source].percentage = total > 0 ? Math.round((sourceStats[source].total / total) * 100 * 100) / 100 : 0;
  });

  return sourceStats;
}

function calculateDailyTrends(data: any[], startDate: Date, endDate: Date) {
  const dailyStats: Record<string, { total: number; ai: number; fallback: number }> = {};
  
  // Initialize all days in range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    dailyStats[dateKey] = { total: 0, ai: 0, fallback: 0 };
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Aggregate data by day
  data.forEach(entry => {
    const dateKey = new Date(entry.created_at).toISOString().split('T')[0];
    if (dailyStats[dateKey]) {
      dailyStats[dateKey].total++;
      const source = entry.metadata?.generated_by || 'unknown';
      if (source === 'openai' || source === 'ai') {
        dailyStats[dateKey].ai++;
      } else if (source === 'fallback') {
        dailyStats[dateKey].fallback++;
      }
    }
  });

  return dailyStats;
}

function calculateTypeBreakdown(data: any[]) {
  const typeStats: Record<string, { total: number; percentage: number }> = {};
  
  data.forEach(entry => {
    const type = entry.type || 'unknown';
    if (!typeStats[type]) {
      typeStats[type] = { total: 0, percentage: 0 };
    }
    typeStats[type].total++;
  });

  // Calculate percentages
  const total = data.length;
  Object.keys(typeStats).forEach(type => {
    typeStats[type].percentage = total > 0 ? Math.round((typeStats[type].total / total) * 100 * 100) / 100 : 0;
  });

  return typeStats;
} 