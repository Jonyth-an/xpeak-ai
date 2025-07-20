"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/app/components/ui'
import { 
  FileText, 
  Image, 
  File, 
  Download, 
  ExternalLink,
  FileImage,
  FilePdf,
  FileSpreadsheet,
  FilePresentation
} from 'lucide-react'

interface FileMessageProps {
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  senderName: string
  timestamp: string
  isOwnMessage: boolean
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return <Image className="h-4 w-4" />
  }
  if (fileType === 'application/pdf') {
    return <FilePdf className="h-4 w-4" />
  }
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
    return <FileSpreadsheet className="h-4 w-4" />
  }
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
    return <FilePresentation className="h-4 w-4" />
  }
  if (fileType.startsWith('text/')) {
    return <FileText className="h-4 w-4" />
  }
  return <File className="h-4 w-4" />
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileTypeLabel = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return 'Image'
  }
  if (fileType === 'application/pdf') {
    return 'PDF'
  }
  if (fileType.includes('word') || fileType.includes('document')) {
    return 'Document'
  }
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
    return 'Spreadsheet'
  }
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
    return 'Presentation'
  }
  if (fileType.startsWith('text/')) {
    return 'Text'
  }
  return 'File'
}

export default function FileMessage({
  fileName,
  fileUrl,
  fileSize,
  fileType,
  senderName,
  timestamp,
  isOwnMessage
}: FileMessageProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePreview = () => {
    window.open(fileUrl, '_blank')
  }

  return (
    <Card 
      className={`max-w-sm transition-all duration-200 ${
        isOwnMessage ? 'ml-auto bg-primary/10' : 'mr-auto bg-surface-muted/50'
      } ${isHovered ? 'shadow-md' : 'shadow-sm'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-surface-muted rounded-lg">
            {getFileIcon(fileType)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium truncate">{fileName}</span>
              <Badge variant="secondary" className="text-xs">
                {getFileTypeLabel(fileType)}
              </Badge>
            </div>
            
            <div className="text-xs text-text-secondary mb-2">
              {formatFileSize(fileSize)} • {senderName} • {timestamp}
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePreview}
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Preview
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                className="flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 