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
    const count = parseInt(searchParams.get('count') || '10');
    const targetLevel = searchParams.get('targetLevel') as any;

    const cefrService = new CEFRWordBankService();
    const recommendedWords = await cefrService.getRecommendedWords(user.id, count, targetLevel);

    return NextResponse.json({ 
      recommendations: recommendedWords,
      count: recommendedWords.length,
      userLevel: targetLevel || 'auto-detected'
    });
  } catch (error) {
    console.error('Error in CEFR recommendations API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 