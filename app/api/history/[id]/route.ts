import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Analysis not found', code: 'NOT_FOUND' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
  }

  // Fetch to get storage path before deleting
  const { data: analysis } = await supabase
    .from('analyses')
    .select('resume_storage_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!analysis) {
    return NextResponse.json({ error: 'Analysis not found', code: 'NOT_FOUND' }, { status: 404 })
  }

  const { error: deleteError } = await supabase
    .from('analyses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message, code: 'DB_ERROR' }, { status: 500 })
  }

  // Best-effort: remove the PDF from storage
  if (analysis.resume_storage_path) {
    await supabase.storage.from('resumes').remove([analysis.resume_storage_path])
  }

  return NextResponse.json({ success: true })
}
