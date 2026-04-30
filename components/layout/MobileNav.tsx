'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ScanText,
  History,
  Settings,
  LogOut,
  FileText,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { SidebarUser } from './Sidebar'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/analyze', icon: ScanText, label: 'New Analysis' },
  { href: '/history', icon: History, label: 'History' },
]

interface MobileNavProps {
  open: boolean
  onClose: () => void
  user: SidebarUser
}

export function MobileNav({ open, onClose, user }: MobileNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    onClose()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  async function handleSignOut() {
    onClose()
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-surface border-r border-border lg:hidden">
        <div className="flex items-center justify-between px-5 h-14 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-background" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-sm text-text-primary">ResumeIQ</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all"
            >
              <Settings className="w-4 h-4 shrink-0" />
              Settings
            </Link>
          </div>
        </nav>

        <div className="border-t border-border p-3 space-y-0.5 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-accent">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
              <p className="text-xs text-text-muted truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-danger hover:bg-danger/5 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
