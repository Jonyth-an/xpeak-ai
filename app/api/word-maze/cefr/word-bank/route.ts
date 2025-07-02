import { NextRequest, NextResponse } from 'next/server';
import { CEFRWordBankService } from '../../../../../lib/services/cefrWordBankService';
import { getUserFromAuthHeader } from '../../../../../lib/serverSupabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Check for bypass auth header (for testing)
    const bypassAuth = request.headers.get('X-Bypass-Auth');
    let user = null;

    if (bypassAuth === 'true') {
      // Use test user for bypass auth
      user = { id: '00000000-0000-0000-0000-000000000001', email: 'test@example.com' };
    } else {
      // Get authenticated user
      const authHeader = request.headers.get('Authorization');
      const { user: authUser, error } = await getUserFromAuthHeader(authHeader);
      
      if (error || !authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      user = authUser;
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') as any;
    const includeAll = searchParams.get('includeAll') === 'true';

    const cefrService = new CEFRWordBankService();

    if (includeAll) {
      // Get all word banks
      const allWordBanks = await cefrService.getAllWordBanks(user.id);
      return NextResponse.json({ wordBanks: allWordBanks });
    } else if (level) {
      // Get specific level word bank
      const wordBank = await cefrService.getWordBank(level, user.id);
      return NextResponse.json({ wordBank });
    } else {
      // Get user's progress across all levels
      const progress = await cefrService.getUserCEFRProgress(user.id);
      return NextResponse.json({ progress });
    }
  } catch (error) {
    console.error('Error in CEFR word bank API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 