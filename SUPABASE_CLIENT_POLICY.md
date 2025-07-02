# Supabase Client Import Policy

## **MANDATORY: Use Shared Supabase Client**

### ✅ **CORRECT USAGE**
Always import from the shared client:
```typescript
import { supabase } from '@/lib/supabaseClient';
// or
import { supabaseClient } from '@/lib/supabaseClient';
```

### ❌ **FORBIDDEN**
Never create duplicate clients:
```typescript
// ❌ DON'T DO THIS
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);

// ❌ DON'T DO THIS
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

## **Why This Policy Exists**

1. **Session Persistence**: The shared client is configured with proper session persistence
2. **Consistency**: Ensures all components use the same session state
3. **Performance**: Prevents multiple client instances
4. **Debugging**: Centralized authentication state management

## **Configuration Details**

The shared client (`lib/supabaseClient.ts`) includes:
- `persistSession: true` - Sessions persist across page refreshes
- `autoRefreshToken: true` - Tokens refresh automatically
- `detectSessionInUrl: true` - Handles OAuth callbacks
- `storage: localStorage` - Uses browser localStorage for persistence
- `storageKey: 'supabase.auth.token'` - Consistent storage key

## **Server-Side Guidelines**

### **Preferred: Use Shared Server-Side Client**
```typescript
// ✅ RECOMMENDED for server-side
import { serverSupabase, getUserFromAuthHeader } from '@/lib/serverSupabaseClient';

// Validate user token
const { user, error } = await getUserFromAuthHeader(authHeader);
```

### **Alternative: Create Local Client (if needed)**
Only server-side files (API routes, server components) should create their own clients with service role keys:
```typescript
// ✅ ALLOWED for server-side only
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

## **Enforcement**

- All frontend components MUST use the shared client
- All service files MUST use the shared client
- Only API routes and server-side auth can create separate clients
- Code reviews should check for `createClient` usage in frontend code

## **Migration Checklist**

- [x] Replace all frontend `createClient` calls with imports
- [x] Update service files to use shared client
- [x] Verify session persistence works
- [x] Test authentication flow end-to-end 