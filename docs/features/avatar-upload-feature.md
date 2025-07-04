# Avatar Upload Feature with Compression & Cropping

This document describes the enhanced avatar upload feature for the Xpeak AI platform, including image compression and cropping functionality.

## Features

### 🖼️ **Image Compression**
- **Automatic compression** of uploaded images to reduce file size
- **Configurable settings** for quality and size limits
- **Performance optimization** for faster loading times
- **Compression feedback** showing original vs compressed file sizes

### ✂️ **Image Cropping**
- **Interactive cropping interface** with drag-and-drop functionality
- **Square aspect ratio** enforcement for consistent avatars
- **Real-time preview** of cropped area
- **High-quality output** with proper image scaling

### 📱 **Responsive Design**
- **Mobile-friendly** interface
- **Drag & drop** support for desktop
- **Touch-friendly** controls for mobile devices

## Technical Implementation

### Dependencies

```bash
npm install browser-image-compression react-image-crop
```

### Key Components

1. **`lib/storage.ts`** - Storage utilities with compression
2. **`app/profile/components/AvatarUpload.tsx`** - Main upload component
3. **`app/profile/components/ImageCropper.tsx`** - Cropping interface

### Compression Settings

```typescript
export const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,           // Max 1MB after compression
  maxWidthOrHeight: 1024, // Max dimension
  useWebWorker: true,     // Use web worker for better performance
  fileType: 'image/jpeg', // Convert to JPEG for better compression
  quality: 0.8,           // 80% quality
};
```

### File Validation

- **Supported formats**: JPEG, JPG, PNG, WebP
- **Maximum size**: 5MB (before compression)
- **Aspect ratio**: 1:1 (square) enforced through cropping

## Usage

### Basic Upload Flow

1. **File Selection**: User selects or drags an image file
2. **Validation**: File type and size are validated
3. **Cropping**: User crops the image to square format
4. **Compression**: Image is automatically compressed
5. **Upload**: Compressed image is uploaded to Supabase Storage
6. **Feedback**: Compression statistics are displayed

### Component Usage

```tsx
import AvatarUpload from '@/app/profile/components/AvatarUpload';

function ProfilePage() {
  const handleAvatarUpdate = (avatarUrl: string) => {
    // Handle avatar URL update
    console.log('New avatar URL:', avatarUrl);
  };

  return (
    <AvatarUpload 
      onAvatarUpdate={handleAvatarUpdate}
      className="max-w-md"
    />
  );
}
```

## Storage Configuration

### Supabase Storage Setup

1. **Create bucket**: `avatars` (public)
2. **Set policies**: Allow authenticated users to upload/delete their own avatars
3. **File naming**: `userId-timestamp.extension`

### Storage Policies

```sql
-- Allow users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = split_part(name, '-', 1)
);

-- Allow users to view all avatars (public)
CREATE POLICY "Public read access to avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND name LIKE auth.uid() || '%'
);
```

## User Experience

### Upload Process

1. **Drag & Drop**: Users can drag images directly onto the upload area
2. **Click to Upload**: Traditional file picker interface
3. **Visual Feedback**: Loading states and progress indicators
4. **Error Handling**: Clear error messages for validation failures

### Cropping Interface

1. **Modal Overlay**: Full-screen cropping interface
2. **Interactive Crop**: Drag to adjust crop area
3. **Aspect Lock**: Maintains 1:1 ratio automatically
4. **Preview**: Real-time preview of final result

### Compression Feedback

After upload, users see:
- Original file size
- Compressed file size
- Percentage of space saved
- Visual confirmation of successful upload

## Performance Benefits

### File Size Reduction
- **Typical compression**: 60-80% size reduction
- **Faster uploads**: Smaller files upload quicker
- **Reduced bandwidth**: Lower data usage for users
- **Better storage efficiency**: More avatars per storage quota

### Loading Performance
- **Faster page loads**: Smaller images load quicker
- **Reduced memory usage**: Smaller images use less browser memory
- **Better mobile experience**: Faster loading on slower connections

## Error Handling

### Validation Errors
- **File type**: Only image files allowed
- **File size**: Maximum 5MB before compression
- **Network errors**: Retry mechanisms and user feedback
- **Storage errors**: Clear error messages for upload failures

### Fallback Behavior
- **Compression failure**: Falls back to original file
- **Cropping failure**: Shows error and allows retry
- **Upload failure**: Preserves existing avatar

## Testing

### Automated Tests

Run the test suite:

```bash
npm run test:avatar-features
```

### Manual Testing Checklist

- [ ] Upload large image (>1MB)
- [ ] Verify cropping modal appears
- [ ] Test cropping functionality
- [ ] Check compression info display
- [ ] Verify final avatar is square
- [ ] Test responsive design on mobile
- [ ] Test error handling with invalid files
- [ ] Verify avatar deletion works

## Future Enhancements

### Planned Features
- **Multiple aspect ratios**: Support for different crop ratios
- **Image filters**: Basic filters and adjustments
- **Avatar history**: Restore previous avatars
- **Bulk upload**: Upload multiple images at once
- **Advanced compression**: More compression options

### Performance Optimizations
- **Lazy loading**: Load avatars only when needed
- **Progressive loading**: Show low-res preview first
- **CDN integration**: Faster global delivery
- **WebP conversion**: Automatic WebP format for supported browsers

## Troubleshooting

### Common Issues

1. **Cropping modal doesn't appear**
   - Check if `react-image-crop` is properly installed
   - Verify CSS imports are included

2. **Compression not working**
   - Check browser console for errors
   - Verify `browser-image-compression` installation

3. **Upload fails**
   - Check Supabase storage policies
   - Verify environment variables
   - Check network connectivity

4. **Images not displaying**
   - Check Supabase bucket permissions
   - Verify public URL generation
   - Check for CORS issues

### Debug Information

Enable debug logging:

```typescript
// In lib/storage.ts
console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
console.log('Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1), '%');
```

## Security Considerations

### File Validation
- **Type checking**: Only image files allowed
- **Size limits**: Prevent abuse of storage
- **Content validation**: Verify file is actually an image

### Access Control
- **User isolation**: Users can only access their own avatars
- **Public read access**: Avatars are publicly viewable
- **Secure deletion**: Proper cleanup of old files

### Privacy
- **No image analysis**: Images are not processed for content
- **Local processing**: Cropping happens in browser
- **Secure storage**: Images stored in Supabase with proper policies

## File Structure

```
app/profile/
├── components/
│   ├── AvatarUpload.tsx          # Main avatar upload component
│   ├── ProfileForm.tsx           # Profile information form
│   ├── PasswordChangeForm.tsx    # Password change form
│   ├── LanguagePreferences.tsx   # Language preferences
│   └── LearningStats.tsx         # Learning statistics
└── page.tsx                      # Profile page with tabbed interface

public/images/
└── default-avatar.svg            # Default avatar image

components/
└── Header.tsx                    # Updated to show user avatar
```

## Component Details

### AvatarUpload Component

**Location**: `app/profile/components/AvatarUpload.tsx`

**Props**:
- `onAvatarUpdate?: (avatarUrl: string) => void` - Callback when avatar is updated
- `className?: string` - Additional CSS classes

**Features**:
- File validation (JPEG, PNG, WebP, max 5MB)
- Drag and drop support
- Real-time preview
- Upload progress tracking
- Error handling and user feedback
- Avatar removal functionality

### Usage Example

```tsx
import AvatarUpload from './components/AvatarUpload';

function ProfilePage() {
  const handleAvatarUpdate = (avatarUrl: string) => {
    console.log('Avatar updated:', avatarUrl);
    // Handle avatar update (e.g., show success message)
  };

  return (
    <AvatarUpload 
      onAvatarUpdate={handleAvatarUpdate}
      className="max-w-md mx-auto"
    />
  );
}
```

## File Validation

### Supported Formats
- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **WebP** (.webp)

### Size Limits
- **Maximum Size**: 5MB
- **Recommended**: 200x200 pixels or larger (square aspect ratio)

### Validation Messages
- Invalid file type: "Please upload a JPEG, PNG, or WebP image."
- File too large: "Image size must be less than 5MB."

## Supabase Storage Setup

### 1. Create Storage Bucket

In your Supabase Dashboard → Storage, create a new bucket:

```sql
-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);
```

### 2. Storage Policies

Set up Row Level Security (RLS) policies:

```sql
-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access to avatars
CREATE POLICY "Public read access to avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update their avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

### 3. File Naming Convention

Files are stored with the following naming pattern:
```
avatars/{user_id}-{timestamp}.{extension}
```

Example: `avatars/123e4567-e89b-12d3-a456-426614174000-1640995200000.jpg`

## User Interface

### Avatar Display

The avatar is displayed in multiple locations:

1. **Profile Page**: Large circular avatar with upload functionality
2. **Header**: Small circular avatar next to user name
3. **Default Avatar**: SVG fallback when no image is uploaded

### Upload Interface

- **Drag & Drop Area**: Dashed border area for file dropping
- **Click to Upload**: Click anywhere in the upload area to select files
- **Progress Bar**: Visual progress indicator during upload
- **Preview**: Real-time preview of selected image
- **Action Buttons**: Upload and Remove buttons

## Error Handling

### Common Errors

1. **File Type Error**: Invalid file format
2. **File Size Error**: File exceeds 5MB limit
3. **Upload Error**: Network or server issues
4. **Storage Error**: Supabase storage issues
5. **Metadata Update Error**: Failed to update user profile

### Error Recovery

- Clear error messages with retry options
- Automatic fallback to default avatar
- Graceful degradation when features fail

## Performance Considerations

### Image Optimization

- **Client-side Validation**: Prevents unnecessary uploads
- **File Size Limits**: Reduces storage and bandwidth usage
- **Caching**: Browser caching for uploaded images
- **Lazy Loading**: Images loaded only when needed

### Storage Management

- **Unique File Names**: Prevents conflicts and enables caching
- **Automatic Cleanup**: Old avatars can be cleaned up periodically
- **CDN Integration**: Supabase provides global CDN for fast loading

## Security Features

### File Validation

- **Type Checking**: Only image files allowed
- **Size Limits**: Prevents large file uploads
- **Content Validation**: Server-side validation (recommended)

### Access Control

- **User-specific Folders**: Each user has their own folder
- **RLS Policies**: Row-level security for storage access
- **Public Read Access**: Avatars are publicly readable for display

## Future Enhancements

### Potential Improvements

1. **Image Cropping**: Client-side image cropping tool
2. **Multiple Formats**: Support for more image formats
3. **Image Compression**: Automatic image compression
4. **Avatar Gallery**: Pre-built avatar selection
5. **Social Media Integration**: Import from social media profiles
6. **AI Avatar Generation**: AI-generated avatars based on user preferences

### Technical Enhancements

1. **WebP Conversion**: Automatic conversion to WebP for better performance
2. **Responsive Images**: Multiple sizes for different display contexts
3. **Progressive Loading**: Progressive JPEG loading
4. **Offline Support**: Offline avatar management
5. **Batch Upload**: Multiple avatar uploads

## Testing

### Manual Testing

1. **Upload Flow**: Test drag & drop and click to upload
2. **File Validation**: Test with invalid file types and sizes
3. **Error Handling**: Test network failures and server errors
4. **UI States**: Test loading, success, and error states
5. **Responsive Design**: Test on mobile and desktop devices

### Automated Testing

```javascript
// Example test for avatar upload
describe('Avatar Upload', () => {
  it('should upload valid image files', async () => {
    // Test implementation
  });

  it('should reject invalid file types', async () => {
    // Test implementation
  });

  it('should show upload progress', async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check Supabase storage configuration and policies
2. **Images Not Displaying**: Verify public URL generation and CORS settings
3. **Large File Errors**: Check file size limits and validation
4. **Permission Errors**: Verify RLS policies and user authentication

### Debug Commands

```sql
-- Check storage bucket configuration
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'avatars';

-- Check user files
SELECT * FROM storage.objects 
WHERE bucket_id = 'avatars' 
AND name LIKE 'avatars/' || auth.uid()::text || '%';
```

## Conclusion

The Avatar Upload feature provides a comprehensive solution for user profile customization with excellent user experience, robust error handling, and secure file management. The implementation is production-ready and can be easily extended with additional features as needed. 