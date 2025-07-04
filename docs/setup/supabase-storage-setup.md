# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for the avatar upload feature in your Xpeak AI application.

## Prerequisites

- A Supabase project (if you don't have one, create it at [supabase.com](https://supabase.com))
- Your Supabase project URL and anon key

## Step 1: Environment Variables

Create a `.env.local` file in your project root with your Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 2: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Configure the bucket:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Check this (so avatars can be accessed publicly)
   - **File size limit**: 5MB (matches our validation)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`

## Step 3: Configure Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies:

### Policy 1: Allow authenticated users to upload avatars
```sql
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Policy 2: Allow users to update their own avatars
```sql
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Policy 3: Allow public read access to avatars
```sql
CREATE POLICY "Public read access to avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

### Policy 4: Allow users to delete their own avatars
```sql
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 4: Enable Row Level Security

Make sure RLS is enabled on the storage.objects table:

```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `/profile` page
3. Try uploading an avatar image
4. Check that the image appears in your Supabase Storage dashboard

## Troubleshooting

### Common Issues:

1. **"Bucket not found" error**
   - Make sure the bucket name is exactly `avatars`
   - Check that the bucket was created successfully

2. **"Permission denied" error**
   - Verify that RLS policies are correctly set up
   - Check that the user is authenticated
   - Ensure the bucket is public

3. **"File too large" error**
   - Check the file size limit in your bucket settings
   - Verify the client-side validation (5MB limit)

4. **"Invalid file type" error**
   - Check the allowed MIME types in your bucket settings
   - Verify the client-side validation

### Debugging:

1. Check the browser console for detailed error messages
2. Look at the Network tab to see the actual HTTP requests
3. Check the Supabase Dashboard logs for server-side errors

## Security Considerations

- The `avatars` bucket is public, which means anyone can view uploaded avatars
- Users can only upload/update/delete their own avatars (enforced by RLS policies)
- File names include user ID and timestamp to prevent conflicts
- File types and sizes are validated both client-side and server-side

## Production Considerations

1. **CDN**: Consider setting up a CDN for better performance
2. **Image Optimization**: Implement image resizing/compression
3. **Backup**: Set up regular backups of your storage bucket
4. **Monitoring**: Monitor storage usage and costs
5. **Cleanup**: Implement cleanup for unused avatars

## Next Steps

After setting up storage, you can enhance the avatar feature with:
- Image cropping and resizing
- Multiple avatar sizes (thumbnail, medium, large)
- Avatar history/versioning
- Automatic cleanup of old avatars 