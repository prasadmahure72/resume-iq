import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parsePDF } from '@/lib/pdf'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME = 'application/pdf'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in to upload a resume.', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('resume')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided. Please attach a PDF.', code: 'NO_FILE' },
        { status: 400 }
      )
    }

    if (file.type !== ALLOWED_MIME) {
      return NextResponse.json(
        { error: 'Only PDF files are accepted.', code: 'INVALID_TYPE' },
        { status: 400 }
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'File exceeds the 5 MB limit. Please compress or trim your PDF.', code: 'FILE_TOO_LARGE' },
        { status: 413 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Server-side text extraction — never in the browser
    const { text, pageCount } = await parsePDF(buffer)

    // Upload original PDF to Supabase Storage
    const fileId = crypto.randomUUID()
    const storagePath = `${user.id}/${fileId}/${file.name}`

    const { error: storageError } = await supabase.storage
      .from('resumes')
      .upload(storagePath, buffer, {
        contentType: ALLOWED_MIME,
        upsert: false,
      })

    if (storageError) {
      console.error('Storage error:', storageError.message)
      return NextResponse.json(
        {
          error: 'Failed to store your resume. Please try again.',
          code: 'STORAGE_ERROR',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      text,
      storagePath,
      filename: file.name,
      pageCount,
    })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Could not extract text')) {
      return NextResponse.json(
        { error: err.message, code: 'PDF_PARSE_ERROR' },
        { status: 422 }
      )
    }
    console.error('Upload error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
