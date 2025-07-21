import { NextRequest, NextResponse } from 'next/server'
import { serverSupabase, getUserFromAuthHeader } from '@/lib/serverSupabaseClient'

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

// Function to sanitize filename for storage
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special characters with underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .substring(0, 200) // Limit length
}

export async function POST(request: NextRequest) {
  try {
    console.log('File upload request received')
    
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header')
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('Token extracted, length:', token.length)
    
    // Verify the token with Supabase
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', user.email)

    const formData = await request.formData()
    const file = formData.get('file') as File
    const lessonId = formData.get('lessonId') as string
    const materialId = formData.get('materialId') as string

    console.log('File received:', file?.name, 'size:', file?.size)
    console.log('Lesson ID:', lessonId)
    console.log('Material ID:', materialId)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Use materialId if provided, otherwise require lessonId
    const folderId = materialId || lessonId
    if (!folderId) {
      return NextResponse.json({ error: 'Lesson ID or Material ID is required' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'File type not allowed. Please upload images, PDFs, or common document formats.' 
      }, { status: 400 })
    }

    // Generate unique filename with sanitization
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const sanitizedOriginalName = sanitizeFilename(file.name.replace(`.${fileExtension}`, ''))
    const sanitizedFileName = `${user.id}/${folderId}/${timestamp}-${sanitizedOriginalName}.${fileExtension}`

    console.log('Uploading to storage with filename:', sanitizedFileName)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await serverSupabase.storage
      .from('lesson-files')
      .upload(sanitizedFileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    console.log('File uploaded successfully to storage')

    // Get public URL
    const { data: { publicUrl } } = serverSupabase.storage
      .from('lesson-files')
      .getPublicUrl(sanitizedFileName)

    console.log('Public URL generated:', publicUrl)

    return NextResponse.json({
      success: true,
      file: {
        url: publicUrl,
        name: file.name,
        size: file.size,
        type: file.type
      }
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 