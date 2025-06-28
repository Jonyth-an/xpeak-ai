import { supabase } from './supabaseClient';
import imageCompression from 'browser-image-compression';

export const STORAGE_BUCKET = 'avatars';
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Compression settings
export const COMPRESSION_OPTIONS = {
  maxSizeMB: 1, // Max 1MB after compression
  maxWidthOrHeight: 1024, // Max dimension
  useWebWorker: true,
  fileType: 'image/jpeg', // Convert to JPEG for better compression
  quality: 0.8, // 80% quality
};

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  originalSize?: number;
  compressedSize?: number;
}

export interface StorageConfig {
  bucket: string;
  maxFileSize: number;
  allowedTypes: string[];
}

export const storageConfig: StorageConfig = {
  bucket: STORAGE_BUCKET,
  maxFileSize: MAX_FILE_SIZE,
  allowedTypes: ALLOWED_FILE_TYPES,
};

/**
 * Compress image before upload
 */
export async function compressImage(file: File): Promise<File> {
  try {
    console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
    
    console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1), '%');
    
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): string | null {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return 'Please upload a JPEG, PNG, or WebP image.';
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `File size must be less than ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(1)}MB.`;
  }

  return null;
}

/**
 * Generate a unique filename for avatar upload
 */
export function generateAvatarFileName(userId: string, originalName: string): string {
  const fileExt = originalName.split('.').pop();
  const timestamp = Date.now();
  return `${userId}-${timestamp}.${fileExt}`;
}

/**
 * Upload avatar with compression
 */
export async function uploadAvatar(userId: string, file: File): Promise<UploadResult> {
  try {
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      return { success: false, error: validationError };
    }

    // Compress image
    const compressedFile = await compressImage(file);
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = compressedFile.name.split('.').pop() || 'jpg';
    const fileName = `${userId}-${timestamp}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    // Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: urlData.publicUrl }
    });

    if (updateError) {
      console.error('Update user error:', updateError);
      return { success: false, error: updateError.message };
    }

    return {
      success: true,
      url: urlData.publicUrl,
      originalSize: file.size,
      compressedSize: compressedFile.size
    };

  } catch (error: any) {
    console.error('Upload error:', error);
    return { success: false, error: error.message || 'Upload failed' };
  }
}

/**
 * Remove avatar from storage
 */
export async function removeAvatar(userId: string): Promise<UploadResult> {
  try {
    // Get current user to find avatar URL
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.user_metadata?.avatar_url) {
      return { success: true }; // No avatar to remove
    }

    // Extract file path from the public URL
    const avatarUrl = user.user_metadata.avatar_url;
    const url = new URL(avatarUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.indexOf(STORAGE_BUCKET);
    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    console.log('Attempting to delete file at path:', filePath);

    // Remove from storage
    const { error: deleteError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return { success: false, error: deleteError.message };
    }

    // Update user metadata to remove avatar URL
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: null }
    });

    if (updateError) {
      console.error('Update user error:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };

  } catch (error: any) {
    console.error('Remove avatar error:', error);
    return { success: false, error: error.message || 'Remove failed' };
  }
}

/**
 * Get avatar URL for a user
 */
export function getAvatarUrl(userId: string, avatarUrl?: string): string {
  if (avatarUrl) {
    return avatarUrl;
  }
  
  // Return default avatar
  return '/images/default-avatar.svg';
}

/**
 * Check if storage bucket exists
 */
export async function checkStorageBucket(): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.getBucket(STORAGE_BUCKET);
    return !error && data !== null;
  } catch (error) {
    console.error('Error checking storage bucket:', error);
    return false;
  }
}

/**
 * Get storage bucket info
 */
export async function getStorageBucketInfo() {
  try {
    const { data, error } = await supabase.storage.getBucket(STORAGE_BUCKET);
    if (error) {
      throw error;
    }
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
} 