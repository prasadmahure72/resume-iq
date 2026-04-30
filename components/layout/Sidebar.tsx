'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ScanText,
  History,
  Settings,
  LogOut,
  FileText,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/analyze', icon: ScanText, label: 'New Analysis' },
  { href: '/history', icon: History, label: 'History' },
]

export interface SidebarUser {
  name: string
  email: string
  avatarUrl?: string | null
}

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen bg-surface border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border shrink-0">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <FileText className="w-3.5 h-3.5 text-background" strokeWidth={2.5} />
        </div>
        <span className="font-semibold text-sm text-text-primary tracking-tight">
          ResumeIQ
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}

        <div className="pt-3 mt-3 border-t border-border">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150"
          >
            <Settings className="w-4 h-4 shrink-0" />
            Settings
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-border p-3 space-y-0.5 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-accent">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary truncate">
              {user.name}
            </p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-danger hover:bg-danger/5 transition-all duration-150"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
