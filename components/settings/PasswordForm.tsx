'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function PasswordForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (updateError) throw new Error(updateError.message)

      setSaved(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = (hasError?: boolean) =>
    cn(
      'w-full px-3.5 py-2.5 rounded-lg text-sm text-text-primary placeholder:text-text-muted',
      'bg-background border focus:outline-none focus:ring-2 transition-colors',
      hasError
        ? 'border-danger focus:ring-danger/20'
        : 'border-border focus:ring-accent/25 focus:border-accent'
    )

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* New password */}
      <div>
        <label htmlFor="newPassword" className="block text-xs font-medium text-text-secondary mb-1.5">
          New password
        </label>
        <div className="relative">
          <input
            id="newPassword"
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min 8 characters"
            autoComplete="new-password"
            className={cn(inputClass(), 'pr-10')}
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            aria-label={showNew ? 'Hide password' : 'Show password'}
          >
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Confirm password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-xs font-medium text-text-secondary mb-1.5">
          Confirm new password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            autoComplete="new-password"
            className={cn(inputClass(!!error && error.includes('match')), 'pr-10')}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      <button
        type="submit"
        disabled={saving || !newPassword || !confirmPassword}
        className={cn(
          'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all',
          saving || !newPassword || !confirmPassword
            ? 'bg-surface border border-border text-text-muted cursor-not-allowed'
            : 'bg-accent hover:bg-accent-hover text-background'
        )}
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saved && <CheckCircle2 className="w-4 h-4" />}
        {saving ? 'Updating…' : saved ? 'Password updated!' : 'Update password'}
      </button>
    </form>
  )
}
