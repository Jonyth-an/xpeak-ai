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
    <div className="min-h-screen bg-token-surface-accent-light flex items-center justify-center">
      <div className="bg-token-surface p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-text mb-4">Supabase Client Test</h1>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${status === 'Connected successfully!' ? 'bg-token-success' : status === 'Failed' ? 'bg-token-error' : 'bg-token-warning'}`}></div>
            <span className="text-sm font-medium">{status}</span>
          </div>
          
          {error && (
            <div className="bg-token-error-light border border-token-error-light rounded-md p-3">
              <p className="text-token-error text-sm">{error}</p>
            </div>
          )}
          
          {status === 'Connected successfully!' && (
            <div className="bg-token-success-light border border-token-success-light rounded-md p-3">
              <p className="text-token-success-dark text-sm">
                ✅ Supabase client is working correctly! You can now proceed with authentication integration.
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-xs text-text-tertiary">
          <p>Environment variables loaded:</p>
          <p>• NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
          <p>• NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
        </div>
      </div>
    </div>
  );
} 