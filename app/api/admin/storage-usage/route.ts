import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const adminUser = authResult.user;
    console.log('Admin user authenticated:', adminUser.email);

    // For now, we'll return mock storage data since we don't have a storage tracking table yet
    // In a real implementation, you would query Supabase Storage or a storage_usage table
    const mockStorageData = [
      {
        user_email: 'clshou@gmail.com',
        storage_used: 2.5 * 1024 * 1024, // 2.5 MB
        file_count: 5,
        last_updated: new Date().toISOString()
      },
      {
        user_email: 'test@example.com',
        storage_used: 1.2 * 1024 * 1024, // 1.2 MB
        file_count: 3,
        last_updated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_email: 'demo@example.com',
        storage_used: 3.8 * 1024 * 1024, // 3.8 MB
        file_count: 8,
        last_updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Calculate totals
    const totalStorage = mockStorageData.reduce((sum, storage) => sum + storage.storage_used, 0);
    const totalFiles = mockStorageData.reduce((sum, storage) => sum + storage.file_count, 0);

    return NextResponse.json({
      storage: mockStorageData,
      totals: {
        storage_used: totalStorage,
        file_count: totalFiles,
        users_with_storage: mockStorageData.length
      },
      generatedAt: new Date().toISOString(),
      generatedBy: adminUser.email
    });

  } catch (error) {
    console.error('Error fetching admin storage data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 