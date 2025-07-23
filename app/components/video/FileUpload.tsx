"use client"

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui'
import { 
  Upload, 
  X, 
  File, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  selectedFile: File | null
  isUploading: boolean
  uploadProgress?: number
  error?: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileTypeLabel = (fileType: string) => {
  if (fileType.startsWith('image/')) return 'Image'
  if (fileType === 'application/pdf') return 'PDF'
  if (fileType.includes('word') || fileType.includes('document')) return 'Document'
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'Spreadsheet'
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'Presentation'
  if (fileType.startsWith('text/')) return 'Text'
  return 'File'
}

export default function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  isUploading,
  uploadProgress = 0,
  error
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    }
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'File type not allowed. Please upload images, PDFs, or common document formats.'
    }
    
    return null
  }

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      // You might want to show this error in a toast or alert
      console.error(validationError)
      return
    }
    onFileSelect(file)
  }, [onFileSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  if (selectedFile) {
    return (
      <div className="p-3 border border-border rounded-lg bg-surface-muted/50">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 p-2 bg-surface rounded-lg">
            <File className="h-4 w-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium truncate">{selectedFile.name}</span>
              <Badge variant="secondary" className="text-xs">
                {getFileTypeLabel(selectedFile.type)}
              </Badge>
            </div>
            
            <div className="text-xs text-text-secondary">
              {formatFileSize(selectedFile.size)}
            </div>
            
            {isUploading && (
              <div className="mt-2">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Uploading... {uploadProgress}%
                </div>
                <div className="w-full bg-surface-muted rounded-full h-1 mt-1">
                  <div 
                    className="bg-primary h-1 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-1 mt-2 text-xs text-error">
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onFileRemove}
            disabled={isUploading}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`p-4 border-2 border-dashed rounded-lg text-center transition-colors ${
        isDragOver 
          ? 'border-primary bg-primary/5' 
          : 'border-border/25 hover:border-border/50'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInputChange}
        accept={ALLOWED_FILE_TYPES.join(',')}
      />
      
      <div className="flex flex-col items-center gap-2">
        <Upload className="h-8 w-8 text-text-secondary" />
        
        <div>
          <p className="text-sm font-medium">
            Drop a file here or{' '}
            <button
              type="button"
              onClick={handleUploadClick}
              className="text-primary hover:underline"
            >
              browse
            </button>
          </p>
          
          <p className="text-xs text-text-secondary mt-1">
            Max size: 10MB • Images, PDFs, Documents
          </p>
        </div>
      </div>
    </div>
  )
} 