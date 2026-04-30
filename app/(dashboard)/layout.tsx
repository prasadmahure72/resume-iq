import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Attempt to read profile; fall back gracefully if migration not yet run
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, avatar_url')
    .eq('id', user.id)
    .single()

  const sidebarUser = {
    name:
      profile?.full_name ??
      user.user_metadata?.full_name ??
      user.email?.split('@')[0] ??
      'User',
    email: user.email ?? '',
    avatarUrl: profile?.avatar_url ?? null,
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar user={sidebarUser} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar user={sidebarUser} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
