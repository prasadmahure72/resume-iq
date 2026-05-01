import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { User, Mail, BarChart3, CalendarDays, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { PasswordForm } from '@/components/settings/PasswordForm'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Account Settings' }

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="w-7 h-7 rounded-md bg-surface-hover flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-text-secondary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-medium text-text-primary truncate">{value}</p>
      </div>
    </div>
  )
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, analyses_count, created_at')
    .eq('id', user.id)
    .single()

  const displayName =
    profile?.full_name ??
    user.user_metadata?.full_name ??
    user.email?.split('@')[0] ??
    'User'

  const email = user.email ?? ''
  const analysesCount = profile?.analyses_count ?? 0
  const memberSince = profile?.created_at
    ? formatDate(profile.created_at)
    : formatDate(user.created_at)

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Account Settings</h1>
        <p className="text-text-secondary text-sm mt-1">
          Manage your profile and account information.
        </p>
      </div>

      {/* Profile card */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-accent">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-text-primary">{displayName}</p>
              <p className="text-sm text-text-muted">{email}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Edit Profile</h2>
          <ProfileForm initialName={displayName} email={email} />
        </div>
      </div>

      {/* Password */}
      <div className="bg-surface border border-border rounded-2xl px-6 py-5">
        <h2 className="text-sm font-semibold text-text-primary mb-1">Change Password</h2>
        <p className="text-xs text-text-muted mb-5">
          Leave blank if you signed up with Google and don&apos;t want a password yet.
        </p>
        <PasswordForm />
      </div>

      {/* Account info */}
      <div className="bg-surface border border-border rounded-2xl px-6 py-5 space-y-1">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Account Info</h2>
        <InfoRow icon={User} label="Display name" value={displayName} />
        <InfoRow icon={Mail} label="Email address" value={email} />
        <InfoRow icon={BarChart3} label="Total analyses" value={String(analysesCount)} />
        <InfoRow icon={CalendarDays} label="Member since" value={memberSince} />
        <InfoRow icon={ShieldCheck} label="Account status" value="Active" />
      </div>

      {/* Footer note */}
      <p className="text-xs text-text-muted text-center">
        © {new Date().getFullYear()} ResumeIQ · Developed by Prasad M
      </p>
    </div>
  )
}
