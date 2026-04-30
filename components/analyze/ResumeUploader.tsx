'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import {
  FileText,
  Upload,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { useAnalysisStore } from '@/store/analysisStore'
import { cn, formatFileSize, truncate } from '@/lib/utils'

const MAX_BYTES = 5 * 1024 * 1024

interface UploadResponse {
  text: string
  storagePath: string
  filename: string
  pageCount: number
}

function validateFile(file: File): string | null {
  if (file.type !== 'application/pdf') return 'Only PDF files are accepted.'
  if (file.size > MAX_BYTES) return 'File must be 5 MB or less.'
  return null
}

export function ResumeUploader() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { uploadedFile, isUploading, setUploadedFile, setIsUploading } =
    useAnalysisStore()

  const upload = useCallback(
    async (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setUploadError(validationError)
        return
      }

      setUploadError(null)
      setIsUploading(true)

      try {
        const form = new FormData()
        form.append('resume', file)

        const res = await fetch('/api/upload', { method: 'POST', body: form })
        const data: UploadResponse & { error?: string } = await res.json()

        if (!res.ok) {
          setUploadError(data.error ?? 'Upload failed. Please try again.')
          return
        }

        setUploadedFile({
          file,
          text: data.text,
          storagePath: data.storagePath,
          filename: data.filename,
          pageCount: data.pageCount,
        })
        toast.success('Resume uploaded successfully.')
      } catch {
        setUploadError('Network error. Check your connection and try again.')
      } finally {
        setIsUploading(false)
      }
    },
    [setUploadedFile, setIsUploading]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) upload(file)
    },
    [upload]
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) upload(file)
    e.target.value = ''
  }

  function handleRemove() {
    setUploadedFile(null)
    setUploadError(null)
  }

  /* ── Uploaded state ────────────────────────────── */
  if (uploadedFile) {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent/5 overflow-hidden">
        {/* File info bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-accent/15">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {uploadedFile.filename}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {uploadedFile.pageCount} {uploadedFile.pageCount === 1 ? 'page' : 'pages'} ·{' '}
              {formatFileSize(uploadedFile.file.size)}
            </p>
          </div>
          <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
          <button
            onClick={handleRemove}
            className="p-1 rounded-md text-text-muted hover:text-danger hover:bg-danger/5 transition-colors ml-1"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text preview */}
        <div className="px-4 py-3">
          <p className="text-xs text-text-muted mb-1.5 font-medium uppercase tracking-wider">
            Extracted text preview
          </p>
          <p className="text-xs text-text-secondary leading-relaxed font-mono">
            {truncate(uploadedFile.text, 220)}
          </p>
        </div>
      </div>
    )
  }

  /* ── Drop zone ─────────────────────────────────── */
  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload resume PDF"
        className={cn(
          'relative flex flex-col items-center justify-center gap-3',
          'min-h-44 rounded-xl border-2 border-dashed transition-all duration-200',
          'cursor-pointer select-none',
          isUploading
            ? 'border-border bg-surface pointer-events-none'
            : isDragging
              ? 'border-accent bg-accent/5 shadow-[0_0_0_4px_rgba(0,212,146,0.08)]'
              : 'border-border bg-surface hover:border-accent/50 hover:bg-surface-hover'
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-sm text-text-secondary font-medium">
              Extracting text from PDF…
            </p>
          </>
        ) : (
          <>
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                isDragging ? 'bg-accent/20' : 'bg-surface-hover'
              )}
            >
              {isDragging ? (
                <FileText className="w-6 h-6 text-accent" />
              ) : (
                <Upload className="w-6 h-6 text-text-muted" />
              )}
            </div>
            <div className="text-center px-4">
              <p className="text-sm font-medium text-text-primary">
                {isDragging ? 'Drop it here' : 'Drag & drop your resume'}
              </p>
              {!isDragging && (
                <p className="text-xs text-text-muted mt-1">
                  or{' '}
                  <span className="text-accent font-medium">click to browse</span>
                </p>
              )}
            </div>
            <p className="text-xs text-text-muted">PDF only · Max 5 MB</p>
          </>
        )}
      </div>

      {/* Error */}
      {uploadError && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-danger/5 border border-danger/20">
          <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <p className="text-xs text-danger">{uploadError}</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleChange}
        className="hidden"
        aria-hidden
      />
    </div>
  )
}
