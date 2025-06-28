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

interface AvatarUploadProps {
  onAvatarUpdate?: (avatarUrl: string) => void;
  className?: string;
}

export default function AvatarUpload({ onAvatarUpdate, className = '' }: AvatarUploadProps) {
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

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    setCompressionInfo(null);
    
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Avatar Display */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={currentAvatarUrl}
            alt="Current avatar"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <Text variant="h4" className="text-gray-900 mb-1">
            Profile Photo
          </Text>
          <Text variant="body" className="text-gray-600 mb-2">
            Upload a square image for best results. We'll automatically compress and crop it.
          </Text>
          
          {compressionInfo && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
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
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <Text variant="body" className="text-gray-600">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Click to upload
                </button>
                {' '}or drag and drop
              </Text>
              <Text variant="small" className="text-gray-500">
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <Text variant="body" className="text-red-600">
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

      {/* Image Cropper Modal */}
      {showCropper && selectedFile && (
        <ImageCropper
          imageFile={selectedFile}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1} // Square aspect ratio
        />
      )}
    </div>
  );
} 