'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { 
  uploadAvatar, 
  removeAvatar as removeAvatarFromStorage, 
  getAvatarUrl, 
  validateFile 
} from '@/lib/storage';
import { Button, Text } from '@/app/components/ui';
import ImageCropper from './ImageCropper';
import { Avatar } from '@/app/components/ui';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface AvatarUploadProps {
  onAvatarUpdate?: (avatarUrl: string) => void;
  className?: string;
  compact?: boolean;
}

export default function AvatarUpload({ onAvatarUpdate, className = '', compact = true }: AvatarUploadProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize: number;
    compressedSize: number;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New: show upload area only when uploading
  const [showUpload, setShowUpload] = useState(false);New

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    setCompressionInfo(null);
    
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Close the upload dialog before opening cropper
    setShowUpload(false);

    // Show cropper for the selected file
    setSelectedFile(file);
    setShowCropper(true);
  }, []);

  const handleCropComplete = useCallback(async (croppedFile: File) => {
    setShowCropper(false);
    setSelectedFile(null);
    
    // Create preview URL for the cropped image
    const previewUrl = URL.createObjectURL(croppedFile);
    setPreviewUrl(previewUrl);
    
    // Upload the cropped image
    await handleUpload(croppedFile);
  }, []);

  const handleCropCancel = useCallback(() => {
    setShowCropper(false);
    setSelectedFile(null);
  }, []);

  const handleUpload = async (file: File) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const result = await uploadAvatar(user.id, file);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Show compression info if available
      if (result.originalSize && result.compressedSize) {
        setCompressionInfo({
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
        });
      }

      // Call callback with new avatar URL
      if (onAvatarUpdate && result.url) {
        onAvatarUpdate(result.url);
      }

      // Clear preview after successful upload
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.user_metadata?.avatar_url) return;

    setIsUploading(true);
    try {
      const result = await removeAvatarFromStorage(user?.id || '');

      if (!result.success) {
        throw new Error(result.error);
      }

      // Call callback with empty string
      if (onAvatarUpdate) {
        onAvatarUpdate('');
      }

    } catch (err: any) {
      console.error('Avatar removal error:', err);
      setError(err.message || 'Failed to remove avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const currentAvatarUrl = user?.user_metadata?.avatar_url || '/images/default-avatar.svg';

  // New compact layout
  if (compact) {
    return (
      <>
        <div className={`flex flex-col items-center justify-center gap-4 py-8 ${className}`}>
          {/* Section Title */}
          <div className="font-semibold text-lg mb-1">Profile Photo</div>
          {/* Avatar */}
          <Avatar
            src={currentAvatarUrl}
            alt="Current avatar"
            className="w-20 h-20 rounded-full object-cover border-2 border-token-border mb-2"
          />
          {/* Buttons */}
          <div className="flex gap-2 mt-2">
            <Dialog open={showUpload} onOpenChange={setShowUpload}>
              <DialogTrigger asChild>
                <Button type="button" variant="primary">
                  Upload New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Upload Profile Photo</DialogTitle>
                <DialogDescription>
                  Choose a square image for best results. PNG, JPG, WebP up to 5MB.
                </DialogDescription>
                {/* --- Upload UI below --- */}
                <div className="mt-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                  <div
                    className="border-2 border-dashed border-token-border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-token-primary transition"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    <span className="text-4xl mb-2">📤</span>
                    <span className="text-text-secondary text-sm">Click to upload or drag and drop</span>
                    <span className="text-text-muted text-xs mt-1">PNG, JPG, WebP up to 5MB</span>
                  </div>
                </div>
                {/* --- End Upload UI --- */}
              </DialogContent>
            </Dialog>
            <Button type="button" variant="outline" onClick={handleRemoveAvatar}>
              Remove
            </Button>
          </div>
        </div>
        {/* Cropper modal for both layouts */}
        {showCropper && selectedFile && (
          <ImageCropper
            imageFile={selectedFile}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
            aspectRatio={1}
          />
        )}
      </>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Avatar Display */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={currentAvatarUrl}
            alt="Current avatar"
            className="w-20 h-20 rounded-full object-cover border-2 border-token-border"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <Text variant="h4" className="text-text mb-1">
            Profile Photo
          </Text>
          <Text variant="body" className="text-text-secondary mb-2">
            Upload a square image for best results. We'll automatically compress and crop it.
          </Text>
          
          {compressionInfo && (
            <div className="text-sm text-token-success bg-token-success-surface p-2 rounded">
              <div>Original: {(compressionInfo.originalSize / 1024 / 1024).toFixed(2)} MB</div>
              <div>Compressed: {(compressionInfo.compressedSize / 1024 / 1024).toFixed(2)} MB</div>
              <div>Saved: {((1 - compressionInfo.compressedSize / compressionInfo.originalSize) * 100).toFixed(1)}%</div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver 
            ? 'border-token-primary bg-token-primary-surface' 
            : 'border-token-border hover:border-token-border-hover'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <svg className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <Text variant="body" className="text-text-secondary">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="text-token-primary hover:text-token-primary-hover font-medium"
                >
                  Click to upload
                </button>
                {' '}or drag and drop
              </Text>
              <Text variant="small" className="text-text-muted">
                PNG, JPG, WebP up to 5MB
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          onClick={triggerFileInput}
          disabled={isUploading}
          className="flex-1"
        >
          {isUploading ? 'Uploading...' : 'Upload New Photo'}
        </Button>
        
        {user?.user_metadata?.avatar_url && (
          <Button
            variant="outline"
            onClick={handleRemoveAvatar}
            disabled={isUploading}
          >
            Remove Photo
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-token-error-surface border border-token-error rounded-lg p-3">
          <Text variant="body" className="text-token-error">
            {error}
          </Text>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
} 