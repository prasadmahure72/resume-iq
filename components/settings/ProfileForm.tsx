'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Props {
  initialName: string
  email: string
}

export function ProfileForm({ initialName, email }: Props) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: name.trim(), updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (updateError) throw new Error(updateError.message)

      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div>
        <label
          htmlFor="fullName"
          className="block text-xs font-medium text-text-secondary mb-1.5"
        >
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          className="w-full px-3.5 py-2.5 rounded-lg text-sm text-text-primary placeholder:text-text-muted bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Email address
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full px-3.5 py-2.5 rounded-lg text-sm text-text-muted bg-surface-hover border border-border cursor-not-allowed"
        />
        <p className="text-xs text-text-muted mt-1">Email cannot be changed here.</p>
      </div>

      {error && (
        <p className="text-xs text-danger">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving || !name.trim()}
        className={cn(
          'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all',
          saving || !name.trim()
            ? 'bg-surface border border-border text-text-muted cursor-not-allowed'
            : 'bg-accent hover:bg-accent-hover text-background'
        )}
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saved && <CheckCircle2 className="w-4 h-4" />}
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
      </button>
    </form>
  )
}
