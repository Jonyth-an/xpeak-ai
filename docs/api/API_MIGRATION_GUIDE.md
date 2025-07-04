# API Routes Migration Guide

## **Overview**

This guide helps migrate existing API routes to use the shared server-side Supabase client (`lib/serverSupabaseClient.ts`) for better consistency and maintainability.

## **Migration Benefits**

1. **Consistency**: All API routes use the same client configuration
2. **Maintainability**: Centralized client management
3. **Helper Functions**: Built-in utilities for common operations
4. **Error Handling**: Standardized error handling patterns

## **Migration Steps**

### **Step 1: Replace Client Creation**

#### **Before (Current Pattern)**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

#### **After (Using Shared Client)**
```typescript
import { serverSupabase } from '@/lib/serverSupabaseClient';
```

### **Step 2: Replace Authentication Logic**

#### **Before (Manual Token Validation)**
```typescript
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error) {
        return null;
      }
      
      return user;
    } catch (error) {
      return null;
    }
  }
  
  return null;
}
```

#### **After (Using Helper Function)**
```typescript
import { getUserFromAuthHeader } from '@/lib/serverSupabaseClient';

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const { user, error } = await getUserFromAuthHeader(authHeader);
  
  if (error) {
    console.error('Authentication error:', error);
    return null;
  }
  
  return user;
}
```

### **Step 3: Update Database Operations**

#### **Before**
```typescript
const { data, error } = await supabase
  .from('user_word_collections')
  .select('*')
  .eq('user_id', user.id);
```

#### **After**
```typescript
const { data, error } = await serverSupabase
  .from('user_word_collections')
  .select('*')
  .eq('user_id', user.id);
```

## **Migration Examples**

### **Example 1: Simple API Route**

#### **Before**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { data, error: dbError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (dbError) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}
```

#### **After**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase, getUserFromAuthHeader } from '@/lib/serverSupabaseClient';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const { user, error } = await getUserFromAuthHeader(authHeader);
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error: dbError } = await serverSupabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (dbError) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}
```

## **Available Helper Functions**

### **validateUserToken(token: string)**
Validates a user token and returns user data or error.

### **getUserFromAuthHeader(authHeader: string | null)**
Extracts and validates user from Authorization header.

### **isUserAdmin(userId: string)**
Checks if a user has admin privileges.

## **Migration Checklist**

- [ ] Replace `createClient` import with `serverSupabase` import
- [ ] Remove local client creation code
- [ ] Replace manual token validation with `getUserFromAuthHeader`
- [ ] Update all database operations to use `serverSupabase`
- [ ] Test authentication flow
- [ ] Test database operations
- [ ] Verify error handling

## **Testing After Migration**

1. **Authentication Test**: Verify users can still authenticate
2. **Database Test**: Verify all database operations work
3. **Error Test**: Verify error handling works correctly
4. **Admin Test**: Verify admin functions work (if applicable)

## **Rollback Plan**

If issues arise, you can rollback by:
1. Reverting to the original `createClient` import
2. Restoring the original client creation code
3. Restoring the original authentication logic

## **Notes**

- The shared client maintains the same configuration as individual clients
- No breaking changes to existing functionality
- Improved error handling and logging
- Better code organization and maintainability 