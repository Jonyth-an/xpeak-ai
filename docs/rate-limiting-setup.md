# Rate Limiting Setup Guide

## Database Table Setup

You need to create a table in your Supabase database to track rate limiting attempts.

### 1. Create the Rate Limit Table

Go to your Supabase Dashboard → SQL Editor and run this SQL:

```sql
-- Create rate_limit_attempts table
CREATE TABLE IF NOT EXISTS rate_limit_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- email or user_id
  action TEXT NOT NULL, -- 'email_resend', 'login_attempt', etc.
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  blocked_until TIMESTAMPTZ NULL, -- when the user is blocked until
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_action ON rate_limit_attempts(identifier, action);
CREATE INDEX IF NOT EXISTS idx_rate_limit_timestamp ON rate_limit_attempts(timestamp);
CREATE INDEX IF NOT EXISTS idx_rate_limit_blocked_until ON rate_limit_attempts(blocked_until);

-- Create a function to clean up old rate limit records (optional)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  -- Delete records older than 30 days
  DELETE FROM rate_limit_attempts 
  WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up old records (optional)
-- This requires pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-rate-limits', '0 2 * * *', 'SELECT cleanup_old_rate_limits();');
```

### 2. Row Level Security (RLS) Setup

Enable RLS and create policies for the table:

```sql
-- Enable RLS
ALTER TABLE rate_limit_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read their own rate limit data
CREATE POLICY "Users can read their own rate limit data" ON rate_limit_attempts
  FOR SELECT USING (
    identifier = auth.jwt() ->> 'email' OR 
    identifier = auth.uid()::text
  );

-- Create policy to allow service role to manage all rate limit data
CREATE POLICY "Service role can manage all rate limit data" ON rate_limit_attempts
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy to allow rate limit system to insert records
CREATE POLICY "Rate limit system can insert records" ON rate_limit_attempts
  FOR INSERT WITH CHECK (true);
```

## Rate Limiting Configuration

The system uses these predefined rate limit configurations:

### Email Resend Limits
- **Hourly Limit**: 5 resends per hour per email
- **Per-Minute Limit**: 1 resend per minute per email
- **Block Duration**: 15 minutes after exceeding hourly limit

### Login Attempt Limits
- **15-minute Limit**: 5 login attempts per 15 minutes
- **Block Duration**: 30 minutes after exceeding limit

### Signup Attempt Limits
- **Hourly Limit**: 3 signup attempts per hour per email
- **Block Duration**: 1 hour after exceeding limit

## How It Works

### 1. Rate Limit Check
When a user tries to resend an email:
1. System checks if user has exceeded the rate limit
2. If blocked, shows appropriate message with retry time
3. If allowed, proceeds with the action

### 2. Rate Limit Recording
After each action:
1. System records the attempt in the database
2. Updates the rate limit status for the user
3. Shows remaining attempts to the user

### 3. User Experience
- **Clear messaging**: Users see exactly how many attempts remain
- **Progressive warnings**: Warnings when approaching limits
- **Graceful blocking**: Clear explanation when blocked
- **Automatic unblocking**: System automatically unblocks after timeout

## Testing Rate Limiting

### Test Scenarios

1. **Normal Usage**: Send 1-2 emails, should work fine
2. **Approaching Limit**: Send 4 emails, should see warning
3. **Limit Exceeded**: Send 6th email, should be blocked
4. **Block Duration**: Wait 15 minutes, should be unblocked
5. **Per-Minute Limit**: Try to send 2 emails within 1 minute

### Test Commands

You can test rate limiting by:

```bash
# Test email resend rate limiting
npm run test:email-verification
```

### Manual Testing

1. **Sign up with a new email**
2. **Try resending verification email multiple times**
3. **Observe rate limit messages and blocking behavior**
4. **Wait for the block to expire and try again**

## Monitoring Rate Limiting

### View Rate Limit Data

In Supabase Dashboard → Table Editor → `rate_limit_attempts`:

```sql
-- View recent rate limit attempts
SELECT * FROM rate_limit_attempts 
ORDER BY timestamp DESC 
LIMIT 20;

-- View blocked users
SELECT identifier, action, blocked_until 
FROM rate_limit_attempts 
WHERE blocked_until > NOW();

-- View rate limit statistics
SELECT 
  action,
  COUNT(*) as total_attempts,
  COUNT(CASE WHEN blocked_until IS NOT NULL THEN 1 END) as blocked_attempts
FROM rate_limit_attempts 
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY action;
```

### Admin Actions

You can manually clear rate limits for testing:

```sql
-- Clear rate limits for a specific email
DELETE FROM rate_limit_attempts WHERE identifier = 'test@example.com';

-- Clear all rate limits (use with caution)
DELETE FROM rate_limit_attempts;
```

## Security Considerations

### 1. Fail-Open Strategy
- If rate limiting fails, the system allows the action
- This prevents legitimate users from being blocked due to system issues

### 2. Identifier Protection
- Rate limits are tied to email addresses
- Prevents abuse while allowing legitimate use

### 3. Configurable Limits
- Limits can be easily adjusted in the code
- Different limits for different actions

### 4. Automatic Cleanup
- Old rate limit records are automatically cleaned up
- Prevents database bloat

## Troubleshooting

### Common Issues

1. **Rate limit not working**: Check if the table exists and RLS is configured
2. **Users getting blocked too quickly**: Adjust the rate limit configuration
3. **Database performance**: Ensure indexes are created
4. **RLS blocking operations**: Check RLS policies

### Debug Commands

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'rate_limit_attempts'
);

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'rate_limit_attempts';

-- Check recent attempts for debugging
SELECT * FROM rate_limit_attempts 
WHERE identifier = 'your-email@example.com' 
ORDER BY timestamp DESC;
```

## Future Enhancements

### Potential Improvements

1. **IP-based rate limiting**: Add IP address tracking
2. **Geographic rate limiting**: Different limits by region
3. **Dynamic rate limiting**: Adjust limits based on user behavior
4. **Rate limit analytics**: Dashboard to monitor rate limiting patterns
5. **Whitelist functionality**: Allow certain users to bypass limits 