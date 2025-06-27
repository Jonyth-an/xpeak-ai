'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestSupabasePage() {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Test basic connection by getting the current user session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(`Connection error: ${error.message}`);
          setStatus('Failed');
        } else {
          setStatus('Connected successfully!');
          console.log('Supabase connection test successful:', data);
        }
      } catch (err) {
        setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setStatus('Failed');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Supabase Client Test</h1>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${status === 'Connected successfully!' ? 'bg-green-500' : status === 'Failed' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm font-medium">{status}</span>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          {status === 'Connected successfully!' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-green-800 text-sm">
                ✅ Supabase client is working correctly! You can now proceed with authentication integration.
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-xs text-gray-500">
          <p>Environment variables loaded:</p>
          <p>• NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
          <p>• NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
        </div>
      </div>
    </div>
  );
} 