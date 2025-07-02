import { NextRequest, NextResponse } from 'next/server';
import { CEFRWordBankService } from '../../../../../lib/services/cefrWordBankService';
import { getUserFromAuthHeader } from '../../../../../lib/serverSupabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const authHeader = request.headers.get('Authorization');
    const { user, error } = await getUserFromAuthHeader(authHeader);
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetLevel = searchParams.get('targetLevel') as any;
    const wordsPerLevel = parseInt(searchParams.get('wordsPerLevel') || '20');

    if (!targetLevel) {
      return NextResponse.json({ error: 'targetLevel parameter is required' }, { status: 400 });
    }

    const cefrService = new CEFRWordBankService();
    const learningPath = await cefrService.getLearningPath(user.id, targetLevel, wordsPerLevel);

    // Calculate total estimated time
    const totalEstimatedTime = learningPath.reduce((total, level) => total + level.estimatedTime, 0);

    return NextResponse.json({ 
      learningPath,
      totalEstimatedTime,
      targetLevel,
      wordsPerLevel
    });
  } catch (error) {
    console.error('Error in CEFR learning path API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 