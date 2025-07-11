'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function RolesDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    async function testRoles() {
      console.log('🔍 RolesDebugPage: Starting test...');
      
      try {
        // Test 1: Basic query
        const { data: basicData, error: basicError } = await supabase
          .from('user_roles')
          .select('*');
        
        console.log('🔍 Basic query result:', { basicData, basicError });
        
        // Test 2: Role-specific query
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .eq('role', 'admin');
        
        console.log('🔍 Role query result:', { roleData, roleError });
        
        // Test 3: Multiple roles query
        const { data: multiData, error: multiError } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('role', ['admin', 'marketer', 'tutor approver']);
        
        console.log('🔍 Multi-role query result:', { multiData, multiError });
        
        setDebugInfo({
          basic: { data: basicData, error: basicError },
          role: { data: roleData, error: roleError },
          multi: { data: multiData, error: multiError }
        });
        
      } catch (error) {
        console.error('❌ RolesDebugPage: Error:', error);
        setDebugInfo({ error: error });
      }
    }
    
    testRoles();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Roles Debug Page</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Debug Information:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Open browser console (F12)</li>
            <li>Look for logs starting with 🔍</li>
            <li>Check for any error messages</li>
            <li>Compare with the debug info above</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 