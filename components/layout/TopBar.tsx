'use client'

import { useState } from 'react'
import { Menu, FileText } from 'lucide-react'
import { MobileNav } from './MobileNav'
import type { SidebarUser } from './Sidebar'

export function TopBar({ user }: { user: SidebarUser }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="flex lg:hidden items-center justify-between px-4 h-14 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <FileText className="w-3 h-3 text-background" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold text-text-primary">ResumeIQ</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>
      <MobileNav open={open} onClose={() => setOpen(false)} user={user} />
    </>
  )
}
